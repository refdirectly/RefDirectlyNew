# Referral Fee Pricing Structure (₹99 - ₹999)

## Overview
Updated referral fees to range between ₹99 and ₹999 based on company tier and position level.

## Pricing Matrix

### Tier 1: Top Tech Companies (₹499 - ₹999)
**Companies:** Google, Microsoft, Apple, Amazon, Meta, Netflix, Tesla, NVIDIA, Salesforce, Adobe, Uber, Airbnb, Stripe, Spotify, Twitter, LinkedIn, Dropbox, Slack, Zoom, Palantir, Snowflake

| Position Level | Referral Fee |
|---------------|--------------|
| Senior/Lead/Principal/Manager/Director | ₹999 |
| Mid-level (Software Engineer, Developer) | ₹699 |
| Junior/Intern/Entry/Associate/Fresher | ₹499 |

**Examples:**
- Senior Software Engineer at Google → ₹999
- Software Engineer at Microsoft → ₹699
- Junior Developer at Amazon → ₹499

---

### Tier 2: Indian Unicorns & Major Startups (₹299 - ₹699)
**Companies:** Flipkart, Swiggy, Zomato, Paytm, Ola, BYJU'S, Razorpay, CRED, PhonePe, Zerodha, Dream11, Meesho, ShareChat, Udaan, OYO, PolicyBazaar, Freshworks, Postman, BrowserStack, Chargebee

| Position Level | Referral Fee |
|---------------|--------------|
| Senior/Lead/Principal/Manager/Director | ₹699 |
| Mid-level (Software Engineer, Developer) | ₹499 |
| Junior/Intern/Entry/Associate/Fresher | ₹299 |

**Examples:**
- Tech Lead at Flipkart → ₹699
- Software Engineer at Swiggy → ₹499
- Associate Engineer at Zomato → ₹299

---

### Tier 3: Other Companies (₹99 - ₹399)
**Companies:** All other companies not in Tier 1 or Tier 2

| Position Level | Referral Fee |
|---------------|--------------|
| Senior/Lead/Principal/Manager/Director | ₹399 |
| Mid-level (Software Engineer, Developer) | ₹199 |
| Junior/Intern/Entry/Associate/Fresher | ₹99 |

**Examples:**
- Senior Engineer at XYZ Corp → ₹399
- Software Developer at ABC Tech → ₹199
- Intern at Startup Inc → ₹99

---

## Position Level Detection

### Senior Level Keywords:
- Senior
- Lead
- Principal
- Staff
- Architect
- Manager
- Director

### Junior Level Keywords:
- Junior
- Intern
- Entry
- Associate
- Trainee
- Fresher

### Mid-level (Default):
- Software Engineer
- Developer
- Engineer
- Programmer
- Any position not matching senior or junior keywords

---

## Pricing Logic

```typescript
if (Tier 1 Company) {
  if (Senior Position) → ₹999
  if (Junior Position) → ₹499
  else (Mid-level) → ₹699
}
else if (Tier 2 Company) {
  if (Senior Position) → ₹699
  if (Junior Position) → ₹299
  else (Mid-level) → ₹499
}
else (Tier 3 Company) {
  if (Senior Position) → ₹399
  if (Junior Position) → ₹99
  else (Mid-level) → ₹199
}
```

---

## Examples by Company & Position

### Google (Tier 1)
- Principal Engineer → ₹999
- Software Engineer III → ₹699
- Software Engineer I → ₹499

### Flipkart (Tier 2)
- Engineering Manager → ₹699
- SDE II → ₹499
- SDE I → ₹299

### Local Startup (Tier 3)
- Senior Developer → ₹399
- Full Stack Developer → ₹199
- Junior Developer → ₹99

---

## Benefits of New Pricing

### 1. **Affordable Entry Point**
- ₹99 minimum makes referrals accessible to all job seekers
- Encourages more referral requests

### 2. **Fair Pricing**
- Higher fees for premium companies (Google, Microsoft)
- Lower fees for smaller companies
- Position-based pricing reflects job value

### 3. **Clear Tiers**
- Easy to understand pricing structure
- Transparent fee calculation
- No hidden costs

### 4. **Competitive Advantage**
- Much lower than competitors (typically ₹5,000-10,000)
- Volume-based business model
- Accessible to students and freshers

---

## Comparison: Old vs New Pricing

| Scenario | Old Price | New Price | Savings |
|----------|-----------|-----------|---------|
| Junior at Google | ₹999 | ₹499 | ₹500 |
| Mid-level at Google | ₹4,999 | ₹699 | ₹4,300 |
| Senior at Google | ₹4,999 | ₹999 | ₹4,000 |
| Junior at Flipkart | ₹999 | ₹299 | ₹700 |
| Mid-level at Flipkart | ₹4,999 | ₹499 | ₹4,500 |
| Junior at Startup | ₹999 | ₹99 | ₹900 |
| Mid-level at Startup | ₹1,999 | ₹199 | ₹1,800 |

**Average Savings: 80-90%** 🎉

---

## Marketing Messages

### For Job Seekers:
- "Get referrals starting at just ₹99"
- "Premium company referrals from ₹499"
- "Google referrals for ₹999 (not ₹5,000+)"
- "Affordable referrals for every budget"

### For Referrers:
- "Earn ₹99-999 per referral"
- "Higher volume, steady income"
- "Help more people, earn more"

---

## Implementation Details

### Frontend (JobsPage.tsx)
```typescript
const getReferralFee = (title: string, company: string) => {
  // Tier detection
  const isTier1 = tier1Companies.some(t1 => companyLower.includes(t1));
  const isTier2 = tier2Companies.some(t2 => companyLower.includes(t2));
  
  // Position detection
  const isSenior = titleLower.includes('senior') || ...;
  const isJunior = titleLower.includes('junior') || ...;
  
  // Calculate fee
  if (isTier1) {
    if (isSenior) return 999;
    if (isJunior) return 499;
    return 699;
  }
  // ... more logic
}
```

### Display Format
- Shows as "₹999" in job cards
- Highlighted in purple badge for org postings
- Clear and prominent display

---

## Future Enhancements

### 1. Dynamic Pricing
- Adjust based on demand
- Seasonal pricing
- Bulk discounts

### 2. Premium Features
- Express referrals (+₹200)
- Guaranteed response (+₹300)
- Multiple referrers (+₹100 each)

### 3. Subscription Plans
- Unlimited referrals for ₹999/month
- 5 referrals for ₹499/month
- Student plan: 3 referrals for ₹299/month

### 4. Referral Packages
- Startup Pack: 3 referrals for ₹499
- Growth Pack: 5 referrals for ₹799
- Premium Pack: 10 referrals for ₹1,499

---

## Testing Scenarios

### Test Case 1: Tier 1 Senior
```
Input: "Senior Software Engineer" at "Google"
Expected: ₹999
```

### Test Case 2: Tier 1 Junior
```
Input: "Software Engineer I" at "Microsoft"
Expected: ₹499
```

### Test Case 3: Tier 2 Mid
```
Input: "Software Engineer" at "Flipkart"
Expected: ₹499
```

### Test Case 4: Tier 3 Junior
```
Input: "Junior Developer" at "ABC Startup"
Expected: ₹99
```

### Test Case 5: Edge Cases
```
Input: "Staff Engineer" at "Google India"
Expected: ₹999 (matches "Google" and "Staff")

Input: "Engineering Manager" at "Swiggy"
Expected: ₹699 (matches "Swiggy" and "Manager")
```

---

## Monitoring & Analytics

### Metrics to Track:
1. **Average Referral Fee**: Should be ₹300-500
2. **Conversion Rate by Price**: Track which price points convert best
3. **Revenue per User**: Monitor total spending
4. **Popular Tiers**: Which companies get most requests
5. **Position Distribution**: Senior vs Mid vs Junior requests

### Success Metrics:
- ✅ 50%+ increase in referral requests
- ✅ 80%+ reduction in average fee
- ✅ Higher conversion rate for ₹99-299 range
- ✅ More accessible to students/freshers

---

## Summary

✅ **New Range**: ₹99 - ₹999 (down from ₹999 - ₹4,999)  
✅ **3 Tiers**: Top Tech, Indian Unicorns, Other Companies  
✅ **3 Levels**: Senior, Mid, Junior  
✅ **9 Price Points**: Clear, predictable pricing  
✅ **80-90% Savings**: Much more affordable  
✅ **Accessible**: Starting at just ₹99  

The new pricing makes referrals accessible to everyone while maintaining quality and value! 🎯
