import { InventoryAllocator } from "./InventoryAllocator";

//The basic syntax format of these tests is borrowed from arturnt's boilerplate code, however the test cases themselves are original and comprehensive

describe("Inventory Allocator", () => {
  let allocator: InventoryAllocator;

  beforeAll(() => {
    allocator = new InventoryAllocator();
  });

  it("return empty shipment if no warehosues", () => {
    expect(allocator.computeProposal({ foo: 1 }, {})).toEqual([]);
  });

  it("return empty shipment if empty order", () => {
    expect(allocator.computeProposal({}, { ware1: { foo: 1 } })).toEqual([]);
  });

  it("return empty shipment if warehouses do not contain every item", () => {
    expect(
      allocator.computeProposal(
        { foo: 1, bar: 1, baz: 1 },
        {
          ware1: { foo: 1, bar: 1 },
          ware2: { foo: 1, bar: 1 },
        }
      )
    ).toEqual([]);
  });

  it("return empty shipment if order exceeds total inventory capacity (single warehouse)", () => {
    expect(
      allocator.computeProposal({ foo: 10 }, { ware1: { foo: 5 } })
    ).toEqual([]);
  });

  it("return empty shipment if order exceeds total inventory capacity (multiple warehouses)", () => {
    expect(
      allocator.computeProposal(
        { foo: 20, bar: 15 },
        {
          ware1: { foo: 5, bar: 5 },
          ware2: { foo: 10, bar: 12 },
        }
      )
    ).toEqual([]);
  });

  it("return single shipment if order equals total inventory (single warehouse)", () => {
    expect(
      allocator.computeProposal({ foo: 1 }, { ware1: { foo: 1 } })
    ).toEqual([{ ware1: { foo: 1 } }]);
  });

  it("return single warehouse if total inventory exceeds order (single warehouse)", () => {
    expect(
      allocator.computeProposal({ foo: 1 }, { ware1: { foo: 2 } })
    ).toEqual([{ ware1: { foo: 1 } }]);
  });

  it("returns single warehouse if optimal warehouse is not cheapest (single warehouse)", () => {
    expect(
      allocator.computeProposal(
        { foo: 10, bar: 10 },
        { ware1: { foo: 0 }, ware2: { foo: 10, bar: 10 } }
      )
    ).toEqual([{ ware2: { foo: 10, bar: 10 } }]);
  });

  it("return multiple warehouse if order cannot be satisfied from 1", () => {
    expect(
      allocator.computeProposal(
        { foo: 3 },
        {
          ware1: { foo: 1 },
          ware2: { foo: 1 },
          ware3: { foo: 1 },
        }
      )
    ).toEqual([{ ware1: { foo: 1 }, ware2: { foo: 1 }, ware3: { foo: 1 } }]);
  });

  it("returns cheapest (first) warehouse if order satisfies multiple", () => {
    expect(
      allocator.computeProposal(
        { foo: 2 },
        {
          ware1: { foo: 2 },
          ware2: { foo: 6 },
        }
      )
    ).toEqual([{ ware1: { foo: 2 } }]);
  });

  it("returns single warehouse if order can be filled with only one", () => {
    expect(
      allocator.computeProposal(
        { foo: 10, bar: 20, baz: 30 },
        {
          ware1: { foo: 20, baz: 50 },
          ware2: { foo: 5, bar: 10, baz: 15},
          ware3: { foo: 20, bar: 30, baz: 29},
          ware4: { foo: 15, bar: 25, baz: 30 },
        }
      )
    ).toEqual([
      {
        ware4: { foo: 10, bar: 20, baz: 30 },
      },
    ]);
  });

  it("returns multiple warehouses if order must be split, independent of cost", () => {
    expect(
      allocator.computeProposal(
        { foo: 1, bar: 2, baz: 3 },
        {
          ware1: { baz: 3 },
          ware2: { bar: 2 },
          ware3: { foo: 1 },
        }
      )
    ).toEqual([
      {
        ware1: { baz: 3 },
        ware2: { bar: 2 },
        ware3: { foo: 1 },
      },
    ]);
  });

  it("all items in order can only be split between multiple warehouses", () => {
    expect(
      allocator.computeProposal(
        { foo: 2, bar: 4 },
        {
          ware1: { foo: 1, bar: 3 },
          ware2: { foo: 1, bar: 2 },
        }
      )
    ).toEqual([{ ware1: { foo: 1, bar: 3}, ware2: { foo: 1, bar: 1} }]);
  });

  it("one item in order is split between multiple warehouses", () => {
    expect(
      allocator.computeProposal(
        { foo: 10, bar: 5, baz: 2},
        {
          ware1: { bar: 5},
          ware2: { foo: 1, baz: 2},
          ware3: { foo: 3, bar: 25, baz: 25 },
          ware4: { foo: 6, bar: 18, baz: 22 },
        }
      )
    ).toEqual([
      {
        ware1: { bar: 5},
        ware2: { foo: 1, baz: 2},
        ware3: { foo: 3},
        ware4: { foo: 6},
      },
    ]);
  });

  it("returns single warehouse if order can be filled with only one", () => {
    expect(
      allocator.computeProposal(
        { foo: 10, bar: 20, baz: 30 },
        {
          ware1: { foo: 20, baz: 5 },
          ware2: { foo: 5, bar: 10, baz: 15},
          ware3: { foo: 20, bar: 30, baz: 29},
          ware4: { foo: 15, bar: 15, baz: 30 },
        }
      )
    ).toEqual([
      {
        ware1: { foo: 10, baz: 5 },
        ware2: { bar: 10, baz: 15 },
        ware3: { bar: 10, baz: 10}
      },
    ]);
  });
});
