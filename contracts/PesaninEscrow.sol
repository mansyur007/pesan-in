// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PesaninEscrow
/// @notice Escrow 0% komisi untuk Pesanin. Buyer deposit (subtotal + ongkir),
///         saat order delivered dana auto-distribute: subtotal → merchant,
///         ongkir → driver. Gas fee ditanggung buyer (native Polygon MATIC).
/// @dev    MVP — owner (platform) bertindak sebagai oracle untuk settle/cancel.
///         Production: pakai signed message dari buyer + driver, atau oracle terdesentralisasi.
contract PesaninEscrow {
    enum Status { None, Funded, Settled, Cancelled }

    struct Order {
        address buyer;
        address merchant;
        address driver;
        uint256 subtotal;     // ke merchant
        uint256 deliveryFee;  // ke driver
        Status  status;
    }

    address public owner;
    mapping(bytes32 => Order) public orders;

    event OrderFunded(bytes32 indexed orderId, address buyer, address merchant, uint256 subtotal, uint256 deliveryFee);
    event DriverAssigned(bytes32 indexed orderId, address driver);
    event OrderSettled(bytes32 indexed orderId, address merchant, address driver, uint256 subtotal, uint256 deliveryFee);
    event OrderCancelled(bytes32 indexed orderId, address buyer, uint256 refund);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Buyer memanggil dengan msg.value = subtotal + deliveryFee.
    function fundOrder(
        bytes32 orderId,
        address merchant,
        uint256 subtotal,
        uint256 deliveryFee
    ) external payable {
        require(orders[orderId].status == Status.None, "exists");
        require(msg.value == subtotal + deliveryFee, "bad amount");
        require(merchant != address(0), "bad merchant");

        orders[orderId] = Order({
            buyer: msg.sender,
            merchant: merchant,
            driver: address(0),
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            status: Status.Funded
        });

        emit OrderFunded(orderId, msg.sender, merchant, subtotal, deliveryFee);
    }

    /// @notice Platform assign driver (atau driver self-assign lewat signed msg — future).
    function assignDriver(bytes32 orderId, address driver) external onlyOwner {
        Order storage o = orders[orderId];
        require(o.status == Status.Funded, "not funded");
        require(driver != address(0), "bad driver");
        o.driver = driver;
        emit DriverAssigned(orderId, driver);
    }

    /// @notice Settle: kirim subtotal ke merchant, ongkir ke driver.
    function settleOrder(bytes32 orderId) external onlyOwner {
        Order storage o = orders[orderId];
        require(o.status == Status.Funded, "not funded");
        require(o.driver != address(0), "no driver");

        o.status = Status.Settled;

        (bool okM, ) = o.merchant.call{value: o.subtotal}("");
        require(okM, "merchant payout failed");

        (bool okD, ) = o.driver.call{value: o.deliveryFee}("");
        require(okD, "driver payout failed");

        emit OrderSettled(orderId, o.merchant, o.driver, o.subtotal, o.deliveryFee);
    }

    /// @notice Refund buyer sebelum settle.
    function cancelOrder(bytes32 orderId) external onlyOwner {
        Order storage o = orders[orderId];
        require(o.status == Status.Funded, "not funded");

        uint256 refund = o.subtotal + o.deliveryFee;
        o.status = Status.Cancelled;

        (bool ok, ) = o.buyer.call{value: refund}("");
        require(ok, "refund failed");

        emit OrderCancelled(orderId, o.buyer, refund);
    }

    function getOrder(bytes32 orderId) external view returns (Order memory) {
        return orders[orderId];
    }
}
