# Hydration Best Practices Guide

## Overview

This guide documents hydration-safe patterns and anti-patterns discovered during the PDF tools hydration investigation. Following these practices prevents server-client rendering mismatches and ensures smooth user experiences.

## 🚨 Common Hydration Anti-Patterns

### 1. Client-Only Conditional Rendering

**❌ ANTI-PATTERN:**
```tsx
const [isClient, setIsClient] = useState(false)

useEffect(() => {
  setIsClient(true)
}, [])

return (
  <div>
    {isClient && <Modal />} {/* Server renders nothing, client renders modal */}
  </div>
)
```

**✅ SOLUTION:**
```tsx
const [isMounted, setIsMounted] = useState(false)

useEffect(() => {
  setIsMounted(true)
}, [])

return (
  <div>
    <Modal disabled={!isMounted} /> {/* Consistent structure, disabled until mounted */}
  </div>
)
```

### 2. Dynamic Import with SSR Disabled

**❌ ANTI-PATTERN:**
```tsx
const Component = dynamic(() => import('./Component'), {
  ssr: false // Disables server-side rendering
})
```

**✅ SOLUTION:**
```tsx
const Component = dynamic(() => import('./Component'), {
  ssr: true,
  loading: () => <ComponentSkeleton /> // Consistent loading state
})
```

### 3. Browser-Only APIs in Render

**❌ ANTI-PATTERN:**
```tsx
function Component() {
  const width = window.innerWidth // Crashes on server
  return <div style={{ width }}>{content}</div>
}
```

**✅ SOLUTION:**
```tsx
function Component() {
  const [width, setWidth] = useState(0)
  
  useEffect(() => {
    setWidth(window.innerWidth) // Browser APIs only in useEffect
  }, [])
  
  return <div style={{ width }}>{content}</div>
}
```

### 4. Random Values in Render

**❌ ANTI-PATTERN:**
```tsx
function Component() {
  const id = `item-${Math.random()}` // Different on server vs client
  return <div id={id}>{content}</div>
}
```

**✅ SOLUTION:**
```tsx
function Component() {
  const [id, setId] = useState('')
  
  useEffect(() => {
    setId(`item-${Math.random()}`) // Generate on client only
  }, [])
  
  return <div id={id}>{content}</div>
}
```

## ✅ Hydration-Safe Patterns

### 1. Consistent Structure with Progressive Enhancement

```tsx
function InteractiveComponent() {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  return (
    <div>
      {/* Always render structure */}
      <input 
        disabled={!isMounted} 
        autoFocus={isMounted} 
      />
      <button disabled={!isMounted}>
        Submit
      </button>
    </div>
  )
}
```

### 2. Skeleton Loading States

```tsx
const Component = dynamic(() => import('./HeavyComponent'), {
  ssr: true,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-300 rounded w-1/2" />
    </div>
  )
})
```

### 3. Safe Event Handler Registration

```tsx
function Component() {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
    
    if (!isMounted) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle keyboard events
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMounted])
  
  return <div>{content}</div>
}
```

### 4. Backward Compatible Interfaces

```tsx
interface ComponentProps {
  // Legacy interface
  onFileSelect?: (file: File) => void
  // New interface  
  onUpload?: (files: File[]) => Promise<void>
}

function Component({ onFileSelect, onUpload }: ComponentProps) {
  const isLegacyMode = !!onFileSelect && !onUpload
  
  if (isLegacyMode) {
    // Simple, hydration-safe legacy behavior
    return <SimpleUploader onSelect={onFileSelect} />
  }
  
  // Full-featured new interface
  return <AdvancedUploader onUpload={onUpload} />
}
```

## 🔧 Implementation Guidelines

### 1. Component Mounting Detection

Always use a consistent pattern for detecting when a component has mounted:

```tsx
const [isMounted, setIsMounted] = useState(false)

useEffect(() => {
  setIsMounted(true)
}, [])
```

### 2. Disable Interactions Until Mounted

Prevent user interactions that depend on client-side state:

```tsx
<input 
  disabled={!isMounted}
  autoFocus={isMounted}
  onChange={isMounted ? handleChange : undefined}
/>
```

### 3. Consistent Dimensions

Ensure loading states maintain the same dimensions as final content:

```tsx
// Loading state matches final button dimensions
<Button disabled className="w-32 h-10">
  <div className="animate-pulse bg-gray-300 rounded" />
</Button>
```

### 4. Safe Browser API Usage

Always wrap browser APIs in useEffect:

```tsx
useEffect(() => {
  // Safe to use window, document, localStorage here
  const data = localStorage.getItem('key')
  setStoredData(data)
}, [])
```

## 🧪 Testing Hydration

### 1. Development Testing

```bash
# Enable strict mode in development
# Check browser console for hydration warnings
npm run dev
```

### 2. Server Log Monitoring

Look for these error patterns:
- "Text content does not match"
- "Hydration failed"
- "Warning: Expected server HTML to contain"

### 3. Browser DevTools

1. Open Network tab
2. Disable JavaScript
3. Reload page - should render correctly
4. Re-enable JavaScript - should enhance without layout shifts

## 📋 Checklist for New Components

- [ ] No browser APIs in render function
- [ ] No random values or timestamps in initial render
- [ ] Consistent HTML structure on server and client
- [ ] Loading states match final content dimensions
- [ ] Event listeners registered in useEffect
- [ ] Interactive elements disabled until mounted
- [ ] No conditional rendering based on client-only state

## 🔍 Common Debugging Steps

1. **Check server logs** for hydration errors
2. **Disable JavaScript** and verify page renders correctly
3. **Compare server HTML** with client HTML in DevTools
4. **Look for client-only code** in component render functions
5. **Verify useEffect dependencies** are correct
6. **Test with slow network** to catch timing issues

## 🛠️ Case Study: PDF Tools Hydration Fixes

### Problem Identified
PDF tools were experiencing hydration errors due to the SmartNavigation component using client-only conditional rendering.

### Root Cause Analysis
1. **SmartNavigation Component**: Used `isClient` state with conditional modal rendering
2. **Header Component**: Disabled SSR with `ssr: false` for SmartNavigation
3. **Server vs Client**: Different HTML structure caused hydration mismatch

### Solution Implemented

**Before (Problematic):**
```tsx
// SmartNavigation.tsx
const [isClient, setIsClient] = useState(false)
useEffect(() => { setIsClient(true) }, [])

return (
  <div>
    {isClient && isOpen && ( // Conditional rendering
      <Modal>...</Modal>
    )}
  </div>
)

// Header.tsx
const SmartNavigation = dynamic(..., { ssr: false })
```

**After (Fixed):**
```tsx
// SmartNavigation.tsx
const [isMounted, setIsMounted] = useState(false)
useEffect(() => { setIsMounted(true) }, [])

return (
  <div>
    {isOpen && ( // Always render when open
      <Modal>
        <input disabled={!isMounted} autoFocus={isMounted} />
        <button disabled={!isMounted}>Submit</button>
      </Modal>
    )}
  </div>
)

// Header.tsx
const SmartNavigation = dynamic(..., { ssr: true })
```

### Results
- ✅ Eliminated all hydration errors in PDF tools
- ✅ Improved performance by enabling SSR
- ✅ Maintained full functionality
- ✅ Better SEO and initial page load

## 📚 Additional Resources

- [Next.js Hydration Documentation](https://nextjs.org/docs/messages/react-hydration-error)
- [React Server Components Guide](https://react.dev/reference/react/use-client)
- [Hydration Mismatch Debugging](https://nextjs.org/docs/messages/react-hydration-error)
