# 🔧 Troubleshooting Guide

## Common Issues and Solutions

---

## 🚀 Application Won't Start

### Issue: `ng serve` fails with errors

**Symptoms:**
- Command fails immediately
- Shows compilation errors
- Application doesn't load

**Solutions:**

1. **Clear cache and reinstall**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ng serve
   ```

2. **Check Node.js version**
   ```bash
   node --version  # Should be 18+
   npm --version   # Should be 8+
   ```

3. **Check Angular CLI version**
   ```bash
   ng version  # Should show Angular 17+
   ```

4. **Clear Angular cache**
   ```bash
   ng cache clean
   ng serve
   ```

---

## 🛣️ Routes Not Working

### Issue: Routes return 404 or don't navigate

**Symptoms:**
- Navigation doesn't work
- Routes show 404 page
- URL changes but component doesn't load

**Solutions:**

1. **Verify route configuration**
   - Check `src/app/app.routes.ts`
   - Verify all routes are defined
   - Check for typos in paths

2. **Check component imports**
   - Verify component is imported in route file
   - Verify component is standalone
   - Check for circular dependencies

3. **Verify lazy loading**
   - Check route file exists
   - Verify export name matches
   - Check import path is correct

**Example Fix:**
```typescript
// ❌ Wrong
loadChildren: () => import('./account/account.route')
  .then(m => m.accountRoute)  // Wrong export name

// ✅ Correct
loadChildren: () => import('./account/account.route')
  .then(m => m.accountRoutes)  // Correct export name
```

---

## 📦 Lazy Loading Not Working

### Issue: Chunks not loading or all code in main bundle

**Symptoms:**
- All code in main.js
- No separate chunks in DevTools
- Large initial bundle size

**Solutions:**

1. **Verify route configuration**
   - Check `loadChildren` is used
   - Verify route file path is correct
   - Check export name is correct

2. **Check DevTools Network tab**
   - Open DevTools (F12)
   - Go to Network tab
   - Navigate to lazy route
   - Look for separate chunk file

3. **Verify production build**
   ```bash
   ng build --configuration production
   # Check dist/ folder for separate chunks
   ```

---

## 🔴 Compilation Errors

### Issue: TypeScript compilation errors

**Symptoms:**
- `ng serve` fails
- Shows type errors
- Red squiggles in IDE

**Solutions:**

1. **Check imports**
   ```typescript
   // ❌ Wrong
   import { HttpClientModule } from '@angular/common/http';
   
   // ✅ Correct (already in app.config.ts)
   // No need to import, it's provided globally
   ```

2. **Verify component is standalone**
   ```typescript
   @Component({
     selector: 'app-my',
     standalone: true,  // ← Must be true
     imports: [...]
   })
   ```

3. **Check for circular dependencies**
   - Component A imports Component B
   - Component B imports Component A
   - Solution: Create a shared component or service

---

## 🎨 Styling Issues

### Issue: Styles not applying or looking wrong

**Symptoms:**
- CSS not applied
- Layout broken
- Colors wrong

**Solutions:**

1. **Check CSS file path**
   ```typescript
   @Component({
     styleUrl: './my.component.css'  // ← Check path
   })
   ```

2. **Verify CSS is imported**
   - Check file exists
   - Check path is correct
   - Check file has content

3. **Check for CSS conflicts**
   - Use browser DevTools
   - Inspect element
   - Check which CSS is applied
   - Look for conflicting rules

---

## 🔐 Authentication Issues

### Issue: Login not working or credentials rejected

**Symptoms:**
- Login fails
- Credentials not accepted
- Redirect doesn't happen

**Solutions:**

1. **Check test credentials**
   - Email: `a@b.com`
   - Password: `123`

2. **Verify fake backend**
   - Check `src/app/services/fake-backend.interceptor.ts`
   - Verify interceptor is registered in `app.config.ts`
   - Check browser DevTools for API calls

3. **Check route guards**
   - Verify `authGuard` is applied
   - Check guard logic
   - Verify redirect path

---

## 📡 API Calls Not Working

### Issue: API calls fail or return errors

**Symptoms:**
- Network errors in console
- API calls fail
- Data not loading

**Solutions:**

1. **Verify fake backend interceptor**
   ```bash
   # Check if interceptor is registered
   # Look in app.config.ts for:
   # provideHttpClient(withInterceptors([fakeBackendInterceptor]))
   ```

2. **Check browser DevTools**
   - Open Network tab
   - Look for API calls
   - Check response status
   - Check response data

3. **Verify endpoint**
   - Check URL is correct
   - Check method is correct (GET, POST, etc.)
   - Check headers are correct

---

## 🎯 Component Not Rendering

### Issue: Component loads but doesn't display

**Symptoms:**
- Blank page
- No content visible
- Component in DOM but empty

**Solutions:**

1. **Check component template**
   ```typescript
   @Component({
     template: `<div>Content</div>`  // ← Check template
   })
   ```

2. **Verify component is imported**
   - Check parent component imports
   - Verify import path
   - Check for typos

3. **Check for errors in console**
   - Open DevTools console
   - Look for JavaScript errors
   - Look for Angular errors

---

## 🔄 Infinite Loops or Freezing

### Issue: Application freezes or loops infinitely

**Symptoms:**
- Page freezes
- High CPU usage
- Browser becomes unresponsive

**Solutions:**

1. **Check for circular dependencies**
   - Component A imports Component B
   - Component B imports Component A
   - Solution: Refactor to remove circular dependency

2. **Check for infinite loops in code**
   - Look for `while(true)` loops
   - Check for recursive calls without exit condition
   - Look for change detection issues

3. **Check for memory leaks**
   - Unsubscribe from observables
   - Clean up in `ngOnDestroy`
   - Use `takeUntil` operator

---

## 📱 Responsive Design Issues

### Issue: Layout broken on mobile or tablet

**Symptoms:**
- Layout broken on small screens
- Text too small or too large
- Elements overlapping

**Solutions:**

1. **Check media queries**
   - Verify CSS media queries exist
   - Check breakpoints are correct
   - Test at different screen sizes

2. **Use browser DevTools**
   - Open DevTools (F12)
   - Click device toolbar icon
   - Select different devices
   - Test responsiveness

3. **Check viewport meta tag**
   ```html
   <!-- In index.html -->
   <meta name="viewport" content="width=device-width, initial-scale=1">
   ```

---

## 🎬 GSAP Animations Not Working

### Issue: Animations not playing or broken

**Symptoms:**
- Animations don't play
- Elements jump around
- Animations stutter

**Solutions:**

1. **Verify GSAP is imported**
   - Check `gsap` package is installed
   - Check import statement
   - Check ScrollTrigger is registered

2. **Check animation code**
   - Verify selectors are correct
   - Check elements exist in DOM
   - Look for JavaScript errors

3. **Test in different browsers**
   - Try Chrome, Firefox, Safari
   - Check browser console for errors
   - Verify animations work in all browsers

---

## 🌐 Browser Console Errors

### Common Error Messages and Solutions

#### "Cannot find module"
```
Error: Cannot find module './my-component'
```
**Solution**: Check import path and file name

#### "Component not found"
```
Error: Component 'MyComponent' not found
```
**Solution**: Verify component is imported in route or parent component

#### "Circular dependency"
```
Error: Circular dependency detected
```
**Solution**: Refactor to remove circular imports

#### "Cannot read property of undefined"
```
Error: Cannot read property 'name' of undefined
```
**Solution**: Check if object exists before accessing property

---

## 🔍 Debugging Tips

### 1. Use Browser DevTools
```
F12 or Right-click → Inspect
```

### 2. Check Console Tab
- Look for red errors
- Look for yellow warnings
- Check for network errors

### 3. Check Network Tab
- See all API calls
- Check response status
- Check response data

### 4. Check Elements Tab
- Inspect HTML structure
- Check CSS applied
- Look for missing elements

### 5. Check Application Tab
- Check local storage
- Check session storage
- Check cookies

### 6. Use Angular DevTools Extension
- Install Angular DevTools browser extension
- Inspect component tree
- Check component properties
- Check change detection

---

## 📋 Debugging Checklist

When something doesn't work:

- [ ] Check browser console for errors
- [ ] Check network tab for failed requests
- [ ] Verify file paths are correct
- [ ] Verify imports are correct
- [ ] Check for typos in code
- [ ] Verify component is standalone
- [ ] Check route configuration
- [ ] Verify lazy loading is working
- [ ] Clear cache and rebuild
- [ ] Try in different browser
- [ ] Check documentation
- [ ] Ask for help

---

## 🆘 Getting Help

### Resources
1. **Documentation**
   - See DOCUMENTATION_INDEX.md
   - See STANDALONE_COMPONENTS_GUIDE.md
   - See STANDALONE_EXAMPLES.md

2. **Angular Official Docs**
   - https://angular.io/docs
   - https://angular.io/guide/standalone-components
   - https://angular.io/guide/router

3. **Stack Overflow**
   - Search for error message
   - Tag with `angular` and `typescript`

4. **GitHub Issues**
   - Check Angular GitHub issues
   - Check library GitHub issues

---

## 📞 Support Process

1. **Identify the problem**
   - What exactly is not working?
   - When did it start?
   - What changed?

2. **Gather information**
   - Check console errors
   - Check network tab
   - Check browser version
   - Check Node.js version

3. **Try solutions**
   - Follow troubleshooting steps above
   - Search documentation
   - Try different approaches

4. **Ask for help**
   - Share error message
   - Share code snippet
   - Share steps to reproduce
   - Share environment info

---

## ✅ Verification

After fixing an issue:

- [ ] Error is gone
- [ ] Feature works correctly
- [ ] No new errors introduced
- [ ] Application still compiles
- [ ] All routes still work
- [ ] Lazy loading still works

---

## 🎓 Prevention

To avoid issues:

- ✅ Follow Angular best practices
- ✅ Use TypeScript strict mode
- ✅ Write unit tests
- ✅ Use linting
- ✅ Review code before committing
- ✅ Test on multiple browsers
- ✅ Test on mobile devices
- ✅ Monitor error logs
- ✅ Keep dependencies updated

---

**Last Updated**: 2025-10-22
**Status**: ✅ Complete

