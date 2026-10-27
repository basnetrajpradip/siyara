// Business facts, in one place. The mockup wrote the phone number in 3 files and the
// shipping threshold in 4 (as numbers and as hard-coded "Rs. 2,999" strings).

/** Orders at or above this amount (Rs.) ship free within Nepal. */
export const FREE_SHIPPING_THRESHOLD = 2999

export const SITE = {
  name: "Siyara",
  tagline: "Elegance in Every Thread",
  description:
    "Shop sarees, kurtis, lehengas and accessories online in Nepal. Handpicked ethnic wear, delivered to your door.",
} as const

// TODO: placeholder contact details carried over from the mockup. Confirm the real ones.
export const CONTACT = {
  phone: "+977 9801234567",
  phoneHref: "tel:+9779801234567",
  email: "siyaracollection@gmail.com",
  emailHref: "mailto:siyaracollection@gmail.com",
  address: "Kathmandu, Nepal",
} as const

// TODO: placeholder URLs (the mockup linked every social icon to #home).
export const SOCIALS = {
  facebook: "https://www.facebook.com/siyara",
  instagram: "https://www.instagram.com/siyara",
  youtube: "https://www.youtube.com/@siyara",
  tiktok: "https://www.tiktok.com/@siyara",
} as const

export const PAYMENT_METHODS = ["eSewa", "Khalti", "FonePay", "Visa", "COD"] as const

/** Days a customer has to return or exchange an item. */
export const RETURN_WINDOW_DAYS = 7
