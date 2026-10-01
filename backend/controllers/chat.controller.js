import Item from "../models/item.model.js";
import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";
import Shop from "../models/shop.model.js";

// AI Seafood Culinary & Knowledge Base
const RECIPES = {
  surmai: {
    title: "Crispy Malvani Surmai Fry (King Fish)",
    time: "20 mins",
    ingredients: "Surmai slices, red chili powder, turmeric, ginger-garlic paste, kokum juice/lemon, rava (semolina) & rice flour.",
    steps: [
      "1. Marinate washed Surmai with salt, turmeric, red chili powder, ginger-garlic paste, and kokum extract for 15 mins.",
      "2. Coat evenly in a 50:50 mixture of fine rava and rice flour.",
      "3. Shallow fry in hot coconut or mustard oil for 3-4 mins on each side until golden and crispy.",
      "4. Serve hot with onion rings, lemon wedges, and solkadhi!"
    ]
  },
  bombil: {
    title: "Authentic Coastal Bombil Rava Fry (Bombay Duck)",
    time: "15 mins",
    ingredients: "Fresh/Dry Bombil, turmeric, Malvani masala, lemon, fine semolina (rava), oil.",
    steps: [
      "1. Flatten the bombil slightly using a flat knife/board to remove excess water.",
      "2. Apply spicy red chili-turmeric marinade with fresh lemon juice.",
      "3. Roll generously in seasoned semolina/rava.",
      "4. Deep or shallow fry on high flame until super crunchy on the outside and tender inside!"
    ]
  },
  prawns: {
    title: "Goan Garlic Butter / Sukka Prawns",
    time: "12 mins",
    ingredients: "Tiger/White Prawns (cleaned & deveined), crushed garlic, butter, green chilies, coriander, lemon.",
    steps: [
      "1. Clean and devein fresh prawns. Season lightly with salt and black pepper.",
      "2. Melt generous butter in a hot pan and sauté minced garlic & chopped chilies until aromatic.",
      "3. Toss prawns on high flame for exactly 3 to 4 minutes (do not overcook).",
      "4. Garnish with fresh cilantro, cracked pepper, and fresh lemon squeeze."
    ]
  },
  pomfret: {
    title: "Stuffed Green Pomfret / Tandoori Pomfret",
    time: "25 mins",
    ingredients: "Silver/Black Pomfret (whole slit), green chutney (coriander, mint, coconut, green chili), turmeric, lemon.",
    steps: [
      "1. Make 2-3 deep diagonal slits on both sides and belly of the Pomfret.",
      "2. Stuff belly and slits with thick spicy green coconut chutney.",
      "3. Dust lightly with rice flour and pan fry with 2 tbsp oil on medium flame.",
      "4. Cook 5 mins each side until skin is blistered and flesh flakes easily."
    ]
  },
  crabs: {
    title: "Spicy Coastal Crab Masala Curry",
    time: "30 mins",
    ingredients: "Live/Fresh Mud Crabs, roasted onion-coconut paste (Vatan), curry leaves, tamarind, Malvani masala.",
    steps: [
      "1. Clean and crack crab claws gently for flavors to seep in.",
      "2. Sauté roasted onion-coconut paste with curry leaves and seafood spices in oil.",
      "3. Add crabs, tamarind pulp, and warm water. Simmer covered for 15-18 mins.",
      "4. Serve with steaming steamed rice or bhakri!"
    ]
  }
};

export const handleAiChat = async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, reply: "Please enter a valid message." });
    }

    const query = message.toLowerCase().trim();

    // 1. ORDER & LIVE TRACKING INTENT
    if (
      query.includes("order") || 
      query.includes("track") || 
      query.includes("kahan") || 
      query.includes("status") || 
      query.includes("otp") || 
      query.includes("delivery boy") || 
      query.includes("driver")
    ) {
      if (!userId) {
        return res.json({
          success: true,
          reply: "To track your live orders and view your doorstep OTP, please make sure you are logged in!",
          actionType: "LOGIN_PROMPT",
          suggestions: ["Show fresh seafood", "Active coupon codes", "Surmai Fry Recipe"]
        });
      }

      const latestOrders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate("items.item");

      if (!latestOrders || latestOrders.length === 0) {
        return res.json({
          success: true,
          reply: "You don't have any active orders right now. Would you like to explore today's fresh coastal harvest?",
          actionType: "NAVIGATE",
          actionTarget: "/home",
          suggestions: ["Show today's catch", "Explore Dry Fish", "View Coupons"]
        });
      }

      const activeOrder = latestOrders[0];
      const status = activeOrder.status || "pending";
      const otp = activeOrder.deliveryOtp || "N/A";
      const total = activeOrder.totalAmount || 0;
      const itemCount = activeOrder.items?.length || 0;
      const driverName = activeOrder.deliveryDetails?.deliveryBoyName || "Assigning nearby driver...";

      let statusMsg = "";
      if (status === "delivered") {
        statusMsg = `✅ Your order (#${activeOrder._id.toString().slice(-6)}) was successfully delivered! Total: ₹${total}.`;
      } else if (status === "out_for_delivery") {
        statusMsg = `🚀 **Out for Delivery!** Your rider (${driverName}) is arriving soon. \n\n🔐 **Doorstep Verification OTP:** \`${otp}\` (Share this with rider upon arrival).`;
      } else {
        statusMsg = `📦 **Order Status:** \`${status.toUpperCase()}\` (#${activeOrder._id.toString().slice(-6)})\n💰 Total: ₹${total} (${itemCount} items).\n🔐 **Doorstep OTP:** \`${otp}\``;
      }

      return res.json({
        success: true,
        reply: statusMsg,
        actionType: "ORDER_CARD",
        orderData: {
          id: activeOrder._id,
          status,
          otp,
          total,
          driverName,
          createdAt: activeOrder.createdAt
        },
        suggestions: ["Track Live on Map", "View Order History", "Shop more seafood"]
      });
    }

    // 2. COUPON & DISCOUNT OFFERS INTENT
    if (
      query.includes("coupon") || 
      query.includes("offer") || 
      query.includes("discount") || 
      query.includes("code") || 
      query.includes("promo") || 
      query.includes("sale")
    ) {
      const activeCoupons = await Coupon.find({ isActive: true }).limit(4);
      let couponReply = "🎉 **Active Promo Codes on AquaMart:**\n\n";

      if (activeCoupons && activeCoupons.length > 0) {
        activeCoupons.forEach((c) => {
          couponReply += `🎟️ **\`${c.code}\`**: ${c.discountPercent}% OFF (Min Order: ₹${c.minOrderValue || 0})\n`;
        });
      } else {
        couponReply += `🎟️ **\`AQUA50\`**: Flat ₹50 OFF on first seafood order (Min ₹299)\n🎟️ **\`SEAFOOD20\`**: Flat 20% OFF on fresh ocean catch!\n`;
      }

      couponReply += "\n💡 You can apply these promo codes during checkout for instant savings!";

      return res.json({
        success: true,
        reply: couponReply,
        actionType: "COUPON_LIST",
        coupons: activeCoupons.length > 0 ? activeCoupons : [
          { code: "AQUA50", discountPercent: 15, minOrderValue: 299 },
          { code: "SEAFOOD20", discountPercent: 20, minOrderValue: 499 }
        ],
        suggestions: ["Apply AQUA50 in Cart", "Show Top Selling Fish", "Go to Checkout"]
      });
    }

    // 3. RECIPES & COOKING ADVICE INTENT
    if (
      query.includes("recipe") || 
      query.includes("cook") || 
      query.includes("bana") || 
      query.includes("fry") || 
      query.includes("curry") || 
      query.includes("masala") || 
      query.includes("prepare")
    ) {
      let matchedKey = null;
      if (query.includes("surmai") || query.includes("king fish")) matchedKey = "surmai";
      else if (query.includes("bombil") || query.includes("duck") || query.includes("dry fish")) matchedKey = "bombil";
      else if (query.includes("prawn") || query.includes("kolambi") || query.includes("shrimp") || query.includes("jawla")) matchedKey = "prawns";
      else if (query.includes("pomfret") || query.includes("paplet")) matchedKey = "pomfret";
      else if (query.includes("crab") || query.includes("khekda")) matchedKey = "crabs";

      if (matchedKey && RECIPES[matchedKey]) {
        const recipe = RECIPES[matchedKey];
        let reply = `👨‍🍳 **${recipe.title}** (Prep & Cook Time: ${recipe.time})\n\n`;
        reply += `🛒 **Key Ingredients:** ${recipe.ingredients}\n\n`;
        reply += `🔥 **Step-by-Step Method:**\n` + recipe.steps.join("\n") + "\n\n";
        reply += `💡 *Pro Tip:* Always pat dry your seafood with paper towels before marinating for crispier results!`;

        return res.json({
          success: true,
          reply,
          actionType: "RECIPE_CARD",
          suggestions: ["Show price of this fish", "Add to Cart", "Another Seafood Recipe"]
        });
      } else {
        return res.json({
          success: true,
          reply: "👨‍🍳 I have authentic coastal Malvani & Goan recipes for **Surmai, Bombil, Prawns, Pomfret, and Crabs**! Which seafood would you like a recipe for?",
          suggestions: ["Surmai Fry Recipe", "Crispy Bombil Rava Fry", "Garlic Butter Prawns", "Crab Masala Curry"]
        });
      }
    }

    // 4. CHEMICAL-FREE, HYGIENE & QUALITY POLICY
    if (
      query.includes("fresh") || 
      query.includes("chemical") || 
      query.includes("ammonia") || 
      query.includes("quality") || 
      query.includes("hygiene") || 
      query.includes("halal") || 
      query.includes("clean")
    ) {
      return res.json({
        success: true,
        reply: "🛡️ **AquaMart 100% Quality & Hygiene Assurance:**\n\n" +
               "1. **Zero Formalin / Zero Ammonia**: Daily laboratory tests before stocking.\n" +
               "2. **Ozone Washed & RO Ice-Packed**: Cleaned with purified water and packed in temperature-controlled sealed pouches.\n" +
               "3. **30-Minute Dock-to-Door**: Harvested early morning from Mumbai & Malvan docks straight to your pan.\n" +
               "4. **FSSAI Certified**: Safe for kids, pregnant mothers & whole family!",
        suggestions: ["Show Today's Catch", "Discount Coupons", "Track My Order"]
      });
    }

    // 5. PRODUCT DISCOVERY & SPECIFIC SEAFOOD SEARCH
    const searchTerms = ["surmai", "pomfret", "bombil", "prawn", "crab", "dry", "oyster", "tarli", "bangda", "lobster", "jawla", "fish", "squid", "seafood"];
    const matchedTerm = searchTerms.find(term => query.includes(term));

    if (matchedTerm || query.includes("price") || query.includes("kya hai") || query.includes("chahiye") || query.includes("stock")) {
      const regex = new RegExp(matchedTerm || "fish", "i");
      const matchedItems = await Item.find({
        $or: [
          { name: { $regex: regex } },
          { category: { $regex: regex } },
          { description: { $regex: regex } }
        ],
        isAvailable: true
      }).limit(4);

      if (matchedItems && matchedItems.length > 0) {
        let reply = `🌊 Found **${matchedItems.length} fresh seafood items** for you:\n\n`;
        matchedItems.forEach((item, idx) => {
          reply += `${idx + 1}. **${item.name}** — ₹${item.price}/kg (${item.category})\n`;
        });
        reply += `\nClick on any item below to view portion cuts or add directly to your basket!`;

        return res.json({
          success: true,
          reply,
          actionType: "PRODUCT_GRID",
          products: matchedItems.map(p => ({
            _id: p._id,
            name: p.name,
            price: p.price,
            image: p.image,
            category: p.category,
            stock: p.stock
          })),
          suggestions: ["View Cart", "Active Discounts", "Cooking Recipe"]
        });
      }
    }

    // 6. DEFAULT INTELLIGENT ASSISTANT RESPONSE
    return res.json({
      success: true,
      reply: "👋 Hello! I am **AquaBot**, your 24/7 AI Seafood Concierge.\n\n" +
             "I can help you with:\n" +
             "• 📦 **Live Order Tracking & OTP Verification**\n" +
             "• 🐟 **Today's Fresh Fish & Sun-Cured Dry Stock**\n" +
             "• 🎟️ **Active Discounts & Promo Codes (AQUA50)**\n" +
             "• 👨‍🍳 **Authentic Coastal Recipes & Cooking Tips**\n" +
             "• 🛡️ **Chemical-Free & Hygiene Inquiries**\n\n" +
             "What would you like assistance with today?",
      suggestions: [
        "Track my active order 📦",
        "Show fresh fish prices 🐟",
        "Available discount codes 🎟️",
        "How to fry Surmai? 👨‍🍳"
      ]
    });

  } catch (error) {
    console.error("AI Chatbot Error:", error);
    return res.status(500).json({
      success: false,
      reply: "Sorry, I encountered an issue connecting to the seafood database. Please try again in a moment.",
      suggestions: ["Show Today's Catch", "Track Orders", "Contact Support"]
    });
  }
};
