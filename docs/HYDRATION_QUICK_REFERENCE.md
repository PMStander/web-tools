# Hydration Quick Reference

## 🚨 Red Flags - Avoid These Patterns

```tsx
// ❌ Client-only conditional rendering
{isClient && <Component />}

// ❌ Browser APIs in render
const width = window.innerWidth

// ❌ Random values in render  
const id = Math.random()

// ❌ SSR disabled unnecessarily
dynamic(import, { ssr: false })

// ❌ Date/time in render
const now = new Date().toISOString()
```

## ✅ Safe Patterns - Use These Instead

```tsx
// ✅ Consistent structure with disabled state
<Component disabled={!isMounted} />

// ✅ Browser APIs in useEffect
useEffect(() => {
  const width = window.innerWidth
  setWidth(width)
}, [])

// ✅ Client-only values in useEffect
useEffect(() => {
  setId(Math.random())
}, [])

// ✅ SSR enabled with loading state
dynamic(import, { 
  ssr: true,
  loading: () => <Skeleton />
})

// ✅ Time values in useEffect
useEffect(() => {
  setTimestamp(new Date().toISOString())
}, [])
```

## 🔧 Standard Mounting Pattern

```tsx
function Component() {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  return (
    <div>
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

## 🧪 Quick Test

1. **Disable JavaScript** in browser
2. **Reload page** - should render correctly
3. **Re-enable JavaScript** - should work without layout shifts
4. **Check console** for hydration warnings

## 🔍 Debug Checklist

- [ ] No browser APIs in render function
- [ ] No random/time values in initial render  
- [ ] Event listeners in useEffect only
- [ ] Loading states match final dimensions
- [ ] Interactive elements disabled until mounted
- [ ] No client-only conditional rendering

## 📋 Component Review Questions

1. Does this render the same HTML on server and client?
2. Are all browser APIs wrapped in useEffect?
3. Do loading states prevent layout shifts?
4. Are interactive elements properly disabled?
5. Will this work with JavaScript disabled?
