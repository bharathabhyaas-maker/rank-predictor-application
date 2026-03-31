# Quick Fix for JEE MAIN 2025 Template Type Issue

## 🎯 Immediate Solution

Since the debug is complex, let's use a direct approach to fix your JEE MAIN 2025 template.

## 🔧 Step 1: Check Current Template Data

First, let's see what's actually stored in your database. Run this in your browser console:

```javascript
// Open browser console and run:
fetch('/api/templates')
  .then(res => res.json())
  .then(templates => {
    const jeeTemplate = templates.find(t => t.examCode === 'JEE-MAIN-2025');
    console.log('JEE Template:', jeeTemplate);
    console.log('Type:', jeeTemplate?.type);
    console.log('Placeholders:', jeeTemplate?.placeholders);
  });
```

## 🔧 Step 2: Direct Database Fix (If Needed)

If the template type is wrong, we can fix it directly:

**Option A: Update via API**
```javascript
fetch('/api/templates', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'YOUR_TEMPLATE_ID',
    type: 'conditional' // Force correct type
  })
});
```

**Option B: Manual Database Update**
```sql
UPDATE templates 
SET type = 'conditional' 
WHERE examCode = 'JEE-MAIN-2025';
```

## 🔧 Step 3: Clear Browser Cache

The issue might be browser caching:

1. **Hard refresh**: Ctrl+Shift+R
2. **Clear cache**: F12 → Application → Clear Storage
3. **Restart dev server**: Stop and restart npm run dev

## 🎯 Expected Result

After fixing, your JEE MAIN 2025 should show:

```
JEE MAIN 2025
ACTIVE
Condition Based      ← Correct display
0 predictions | Accuracy: 0

Edit | Assign

Exam Code: JEE-MAIN-2025
Share Link: /jee-main-2025
```

## 🔍 What to Check

1. **Template.type field** should be "conditional"
2. **Template.placeholders** should contain your conditions
3. **UI should display** "Condition Based" with amber badge

## 🚀 If Issue Persists

If it still shows "AI" after these fixes:

1. **Check API response**: What does `/api/templates` actually return?
2. **Check UI logic**: Is the admin page reading the type correctly?
3. **Check caching**: Is there browser caching interfering?

## 📞 Support

Run the debug check first, then let me know what you find. The issue is likely one of:

- **Database has wrong type**
- **API logic not working**  
- **Browser caching old data**
- **UI not refreshing**

Let's identify the exact cause and fix it properly! 🎯
