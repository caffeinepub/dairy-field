import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
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

  type OrderResponse = {
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

  // ADMIN FUNCTIONS // =============================
  func checkAdminPermission(caller : Principal) {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func isValidProduct(product : Product) : Bool {
    product.name.size() > 0 and product.category.size() > 0 and product.price > 0 and product.unit.size() > 0
  };

  func validateProduct(product : Product) {
    let name = product.name;
    if (name.size() == 0) {
      Runtime.trap("Product name cannot be empty");
    };

    let category = product.category;
    if (category.size() == 0) {
      Runtime.trap("Product category cannot be empty");
    };

    if (product.price <= 0) {
      Runtime.trap("Product price must be greater than 0");
    };

    let unit = product.unit;
    if (unit.size() == 0) {
      Runtime.trap("Product unit cannot be empty");
    };

    switch (products.get(name)) {
      case (null) {};
      case (?_) {
        Runtime.trap("A product with this name already exists");
      };
    };

    if (not isValidProduct(product)) {
      Runtime.trap("Product validation failed - unknown reason");
    };
  };

  func validateProducts(products : [Product]) {
    let invalidProducts = products.filter(func(product) { not isValidProduct(product) });
    if (invalidProducts.size() > 0) {
      validateProduct(invalidProducts[0]);
    };
  };

  func validateProductName(name : Text) : Text {
    if (name.size() == 0) { Runtime.trap("Product name cannot be empty") };
    name.toLower();
  };

  // Create Product (Admin) ----------------------------------
  public shared ({ caller }) func createProduct(product : Product) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    validateProduct(product);
    products.add(product.name, product);
  };

  // Bulk fetch products (Admin) --------------------------------
  public query ({ caller }) func getProductsAdmin() : async [Product] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    products.values().toArray();
  };

  // Bulk upsert products (Admin) ------------------------------
  public shared ({ caller }) func upsertProductsAdmin(productsArray : [Product]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    validateProducts(productsArray);

    for (product in productsArray.values()) {
      products.add(product.name, product);
    };
  };

  // Batch update product prices (Admin) ---------------------------
  public shared ({ caller }) func updateProductPrices(priceUpdates : [(Text, Nat)]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
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

  // END ADMIN FUNCTIONS // =============================

  // Calculate total price of cart items
  func calculateTotal(items : [CartItem]) : Nat {
    var total = 0;
    for (item in items.values()) {
      switch (products.get(item.productName)) {
        case (null) { Runtime.trap("Product `" # item.productName # "` not found") };
        case (?product) { total += product.price * item.quantity };
      };
    };
    total;
  };

  // GUEST / USER FUNCTIONS // =============================
  public query ({ caller = _caller }) func listProducts() : async [Product] {
    // No authorization needed - public product listing
    if (products.size() == 0) {
      return [];
    };
    let productsArray = products.values().toArray();
    if (productsArray.size() == 0) {
      return [];
    };
    productsArray.sort();
  };

  // Create Guest Order
  public shared ({ caller }) func createGuestOrder(
    customerName : Text,
    phoneNumber : Text,
    address : Text,
    notes : ?Text,
    items : [CartItem],
  ) : async Nat {
    // No authorization check needed - guests can create orders
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

  // Create Authenticated Order (User)
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

  // Get Specific Order (restricted) - only order creator or admin can view
  public query ({ caller }) func getOrder(orderId : Nat) : async Order {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (caller != order.createdBy and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  // Public method to get order by ID - allows order creator or admin to view
  public query ({ caller }) func getOrderById(orderId : Nat) : async ?OrderResponse {
    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        // Allow access if: caller created the order OR caller is admin
        if (caller == order.createdBy or AccessControl.isAdmin(accessControlState, caller)) {
          ?order;
        } else {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
      };
    };
  };

  // Get All Orders (Admin only)
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };
};
