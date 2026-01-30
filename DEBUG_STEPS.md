## Quick Debugging Steps

The servers are running and database has employees. Let's debug:

### Step 1: Open Browser Console
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Look for errors (red text)

### Step 2: Check Network Tab
1. In DevTools, go to **Network** tab
2. Refresh the page (Ctrl+R)
3. Look for `/projects/match-preview` request
4. Check if it's showing:
   - Status 200 = Success
   - Status 401 = Authentication issue
   - Status 500 = Server error

### Step 3: Manual Test
Open a new terminal and run:
```powershell
cd d:\Nexo
.\backend\venv\Scripts\python test_match_endpoint.py
```

Then paste your auth token when prompted.

### Step 4: Get Your Token
In browser console, type:
```javascript
localStorage.getItem('token')
```
Copy the token value.

---

## Common Issues:

### Issue 1: Token Expired
- **Symptom**: 401 error in Network tab
- **Fix**: Log out and log back in

### Issue 2: Backend Not Running
- **Symptom**: Network error, connection refused
- **Fix**: Check if backend is at http://localhost:8001

### Issue 3: Frontend Cache
- **Symptom**: Old code still running
- **Fix**: Hard refresh (Ctrl+Shift+R)

### Issue 4: Component Error
- **Symptom**: JavaScript error in console
- **Fix**: Check console for specific error message

---

## Tell me what you see in the console!
Look for:
- ⏱️ Debounce timer messages?
- 🚀 Sending match request messages?
- ❌ Any red error messages?
- 📊 Number of employees received?

**Copy and paste the console output here!**
