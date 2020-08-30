import { ShipmentProposal } from "./Shipment";
import { SkuMap } from "./SkuMap";
import { WarehouseInventory } from "./WarehouseInventory";

export class InventoryAllocator {
  /** Retrieves single shipment if determined to be optimal
   * @param order list of items and # to be ordered
   * @param warehouse name of warehouse to order from
   * @returns ShipmentProposal object specifying name/contents of warehouse shipment or ""
   */
  private static singleWarehouse(
    order: SkuMap,
    warehouse: string
  ): ShipmentProposal {
    let shipment: ShipmentProposal = {};
    shipment[warehouse] = order;
    return shipment;
  }

  /** Retrieves shipment from multiple warehouses by filling items iteratively from cheapest warehouse
   * @param order list of items and # to be ordered
   * @param totalInventory two-dimensional list of all warehouses and their inventories
   * @returns ShipmentProposal object specifying name/contents of warehouse shipment or ""
   */
  private static multipleWarehouses(
    order: SkuMap,
    totalInventory: WarehouseInventory
  ): ShipmentProposal {
    let shipment: ShipmentProposal = {};

    for (let warehouse in totalInventory) {
      //Return empty shipment if no order
      if (Object.keys(order).length === 0) {
        break;
      }

      let currentWarehouseShipment: SkuMap = {};

      for (let item in order) {
        // If totalInventory is null, then the item is not stored in the warehouse and we continue
        if (totalInventory[warehouse][item]) {
          //Maximum amount of units we can take from a warehouse
          let availableUnits = Math.min(
            order[item],
            totalInventory[warehouse][item]
          );

          //Removing units leaves less units to buy at more expensive price
          totalInventory[warehouse][item] -= availableUnits;
          order[item] -= availableUnits;

          //No longer need to search for item in future warehouses
          if (order[item] === 0) {
            delete order[item];
          }

          currentWarehouseShipment[item] = availableUnits;
        }
      }

      // Transfer warehouse total to larger ShipmentProposal object unless empty
      if (Object.keys(currentWarehouseShipment).length > 0) {
        shipment[warehouse] = currentWarehouseShipment;
      }
    }

    //Return empty shipment if all warehouses not enough to fill order
    if (Object.keys(order).length > 0) {
      return {};
    }

    return shipment;
  }

  /**
   * @param order list of items and # to be ordered
   * @param totalInventory totalInventory two-dimensional list of all warehouses and their inventories
   * @returns ShipmentProposal of items from a single or multiple warehouses, or empty shipment for empty/unfillable orders
   */
  public computeProposal(
    order: SkuMap,
    totalInventory: WarehouseInventory
  ): ShipmentProposal[] {
    let shipment: ShipmentProposal;
    var shippableWarehouse = "";

    //Return empty shipment if order not found
    if (Object.keys(order).length === 0) {
      return [];
    }

    //Loop over all items in all warehouses to see if one contains the entire order
    for (let warehouse in totalInventory) {
      var warehouseIsSufficient = true;

      for (let item in order) {
        //Warehouse doesn't have enough of a certain item
        if (
          !totalInventory[warehouse][item] ||
          totalInventory[warehouse][item] < order[item]
        ) {
          warehouseIsSufficient = false;
        }
      }

      if (warehouseIsSufficient) {
        shippableWarehouse = warehouse;
        break;
      }
    }

    //If single warehouse can ship, we're done. This is highest on the shipping hierarchy
    if (shippableWarehouse) {
      shipment = InventoryAllocator.singleWarehouse(order, shippableWarehouse);
    } else {
      shipment = InventoryAllocator.multipleWarehouses(order, totalInventory);
    }

    //Return empty shipment if warehouse search yields empty object
    if (Object.keys(shipment).length === 0) {
      return [];
    }

    return [shipment];
  }
}
