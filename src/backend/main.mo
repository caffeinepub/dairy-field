import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public type UserProfile = {
    name : Text;
    phoneNumber : ?Text;
    address : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Function to check if the caller is an admin
  public query ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Product and Order Types
  type Product = {
    name : Text;
    category : Text;
    price : Nat;
    unit : Text;
    description : ?Text;
  };

  type CartItem = {
    productName : Text;
    quantity : Nat;
  };

  type Order = {
    id : Nat;
    customerName : Text;
    phoneNumber : Text;
    address : Text;
    notes : ?Text;
    items : [CartItem];
    totalAmount : Nat;
    timestamp : Int;
    createdBy : Principal;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.name, product2.name);
    };
  };

  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;

  var productDefaults : [Product] = [
    {
      name = "Milk";
      category = "Dairy";
      price = 100;
      unit = "1L";
      description = ?"Fresh cow milk";
    },
    {
      name = "Curd";
      category = "Dairy";
      price = 40;
      unit = "500g";
      description = ?"Traditional Indian yogurt";
    },
    {
      name = "Malai Curd";
      category = "Dairy";
      price = 120;
      unit = "500g";
      description = ?"Creamy yogurt made from full-fat milk";
    },
    {
      name = "Khowa";
      category = "Dairy";
      price = 300;
      unit = "500g";
      description = ?"Thickened milk used in Indian sweets";
    },
    {
      name = "Cream";
      category = "Dairy";
      price = 150;
      unit = "250g";
      description = ?"Rich dairy cream";
    },
    {
      name = "Paneer";
      category = "Dairy";
      price = 300;
      unit = "500g";
      description = ?"Indian cottage cheese";
    },
    {
      name = "Ghee";
      category = "Dairy";
      price = 500;
      unit = "500g";
      description = ?"Clarified butter";
    },
    {
      name = "Cow Ghee";
      category = "Dairy";
      price = 1000;
      unit = "1kg";
      description = ?"Premium cow ghee";
    },
    {
      name = "Ice Candy";
      category = "Frozen Dessert";
      price = 20;
      unit = "Pack";
      description = ?"Fruity frozen treats";
    },
    {
      name = "Malai Bun";
      category = "Dairy";
      price = 60;
      unit = "each";
      description = ?"Sweet naan bread with cream filling";
    },
    {
      name = "Malai Salad";
      category = "Dairy";
      price = 160;
      unit = "each";
      description = ?"Creamy fruit salad with dairy malai";
    },
    {
      name = "Lassi";
      category = "Dairy";
      price = 60;
      unit = "each";
      description = ?"Traditional yogurt-based drink";
    },
    {
      name = "Mango Lassi";
      category = "Dairy";
      price = 80;
      unit = "each";
      description = ?"Lassi with mango flavor";
    },
    {
      name = "Strawberry Lassi";
      category = "Dairy";
      price = 80;
      unit = "each";
      description = ?"Lassi with strawberry flavor";
    },
    {
      name = "Vanilla Lassi";
      category = "Dairy";
      price = 80;
      unit = "each";
      description = ?"Lassi with vanilla flavor";
    },
    {
      name = "Butter Milk";
      category = "Dairy";
      price = 60;
      unit = "each";
      description = ?"Traditional fermented dairy drink (chaas)";
    },
    {
      name = "Family Party Ice Cream Pack";
      category = "Frozen Dessert";
      price = 900;
      unit = "4L";
      description = ?"Large ice cream container for family parties";
    },
    {
      name = "Lavish Pot";
      category = "Frozen Dessert";
      price = 200;
      unit = "3 scoops";
      description = ?"Ice cream set with three different flavors";
    },
  ];

  var products = Map.fromIter<Text, Product>(productDefaults.map(func(p) { (p.name, p) }).values());

  // Admin-only function - only admins can update product prices
  public shared ({ caller }) func updateProductPrice(productName : Text, newPrice : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update product prices");
    };

    switch (products.get(productName)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct = { product with price = newPrice };
        products.add(productName, updatedProduct);
      };
    };
  };

  // Query function - anyone can list products (catalog browsing)
  public query ({ caller }) func listProducts() : async [Product] {
    let sorted = products.toArray().map(func((k, v)) { v }).sort();
    sorted;
  };

  // Admin-only function - batch update product prices
  public shared ({ caller }) func updateProductPrices(priceUpdates : [(Text, Nat)]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update product prices");
    };

    for ((productName, newPrice) in priceUpdates.values()) {
      switch (products.get(productName)) {
        case (null) {};
        case (?product) {
          let updatedProduct = { product with price = newPrice };
          products.add(productName, updatedProduct);
        };
      };
    };
  };

  func calculateTotal(items : [CartItem]) : Nat {
    var total = 0;
    for (item in items.values()) {
      switch (products.get(item.productName)) {
        case (null) { Runtime.trap("Product not found") };
        case (?product) { total += product.price * item.quantity };
      };
    };
    total;
  };

  // New function to allow guest orders (no authentication required)
  public shared ({ caller }) func createGuestOrder(
    customerName : Text,
    phoneNumber : Text,
    address : Text,
    notes : ?Text,
    items : [CartItem],
  ) : async Nat {
    let totalAmount = calculateTotal(items);
    let order : Order = {
      id = nextOrderId;
      customerName;
      phoneNumber;
      address;
      notes;
      items;
      totalAmount;
      timestamp = Time.now();
      createdBy = caller;
    };
    orders.add(nextOrderId, order);
    let orderId = nextOrderId;
    nextOrderId += 1;
    orderId;
  };

  // User-only function - authenticated users can create orders with authentication
  public shared ({ caller }) func createOrder(
    customerName : Text,
    phoneNumber : Text,
    address : Text,
    notes : ?Text,
    items : [CartItem],
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    let totalAmount = calculateTotal(items);
    let order : Order = {
      id = nextOrderId;
      customerName;
      phoneNumber;
      address;
      notes;
      items;
      totalAmount;
      timestamp = Time.now();
      createdBy = caller;
    };
    orders.add(nextOrderId, order);
    let orderId = nextOrderId;
    nextOrderId += 1;
    orderId;
  };

  // Restricted function - only order creator or admin can view
  public query ({ caller }) func getOrder(orderId : Nat) : async Order {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        // Allow order creator or admin to view
        if (caller != order.createdBy and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };
};
