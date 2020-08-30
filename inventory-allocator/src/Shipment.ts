export interface ShipmentProposal {
    [warehouse: string]: {
        [sku: string]: number,
    };
}