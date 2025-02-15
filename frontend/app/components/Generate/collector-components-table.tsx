"use client";
import EllipsisHorizontalIcon from "@heroicons/react/24/outline/EllipsisHorizontalIcon";
import {
  Column,
  ColumnDef,
  createColumnHelper,
  Row,
  RowData,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { Checkbox } from "../../../components/checkbox";
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from "../../../components/dropdown";

import { otelCollectorAtom } from "@/app/atoms/otel.builder.config.atom";
import { OtelComponent } from "@/app/models/otel.builder.config.model";
import { updateCollectorState } from "@/lib/utils";
import {
  Field as FieldHeadless,
  Label as LabelHeadless,
  Switch as SwitchHeadless,
} from "@headlessui/react";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { useAtom } from "jotai";
import { useState } from "react";
import { Button } from "../../../components/catalyst-button";
import { Field, Label } from "../../../components/fieldset";
import { Input } from "../../../components/input";
import { Pagination, PaginationList } from "../../../components/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/table";

export default function OtelCollectorComponentsTable({
  OtelComponents,
}: {
  OtelComponents: OtelComponent[];
}) {
  // Column config
  const columnHelper = createColumnHelper<OtelComponent>();
  const [otelCollector, setOtelCollector] = useAtom(otelCollectorAtom);

  const handleDebugToggle = () => {
    const newDebugMode = !otelCollector.BuilderConfig.debugMode;

    setOtelCollector((prev) => {
      let newState = {
        ...prev,
        BuilderConfig: {
          ...prev.BuilderConfig,
          debugMode: newDebugMode,
        },
      };

      table.getExpandedRowModel().rows.forEach((row: Row<OtelComponent>) => {
        const { type, name } = row.original;

        if (type === "Receiver" && name === "otlpreceiver") {
          newState = updateCollectorState(
            newState,
            "Receiver",
            row.original,
            newDebugMode
          );
        }

        if (type === "Exporter" && name === "debugexporter") {
          newState = updateCollectorState(
            newState,
            "Exporter",
            row.original,
            newDebugMode
          );
        }
      });

      return newState;
    });
  };

  const handleAllRowsSelectionChange = (isSelected: boolean) => {
    table.getExpandedRowModel().rows.forEach((row) => {
      setOtelCollector((prev) =>
        updateCollectorState(prev, row.original.type, row.original, isSelected)
      );
    });
  };

  const handleSingleRowSelectionChange = (
    row: Row<OtelComponent>,
    isSelected: boolean
  ) => {
    setOtelCollector((prev) =>
      updateCollectorState(prev, row.original.type, row.original, isSelected)
    );
  };

  // ToDo: Figure out correct type for any
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const columns = useMemo<ColumnDef<OtelComponent, any>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            color="blue"
            checked={
              table.getIsAllPageRowsSelected() ||
              table.getIsSomePageRowsSelected()
            }
            onChange={(value) => {
              table.toggleAllRowsSelected(!!value);
              handleAllRowsSelectionChange(!!value);
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            color="blue"
            checked={row.getIsSelected()}
            onChange={(value) => {
              row.toggleSelected(!!value);
              handleSingleRowSelectionChange(row, !!value);
            }}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      columnHelper.accessor("type", {
        id: "type",
        sortUndefined: "last",
        header: () => <span className="text-lg">Type</span>,
        footer: (info) => info.column.id,
        meta: {
          filterVariant: "select",
        },
      }),
      columnHelper.accessor("name", {
        id: "name",
        sortUndefined: "last",
        header: () => <span className="text-lg">Name</span>,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("version", {
        id: "version",
        header: () => <span className="text-lg">Version</span>,
        footer: (info) => info.column.id,
      }),
      {
        id: "actions",
        cell: ({ row }) => {
          const component = row.original;

          return (
            <Dropdown>
              <DropdownButton plain aria-label="More options">
                <EllipsisHorizontalIcon />
              </DropdownButton>
              <DropdownMenu>
                <DropdownItem
                  onClick={() =>
                    navigator.clipboard.writeText(component.moduleUrl)
                  }
                >
                  Copy component URL
                </DropdownItem>
                <DropdownItem target="_blank" href={component.githubUrl}>
                  View component
                </DropdownItem>
                <DropdownItem
                  target="_blank"
                  href={component.githubUrl + "/README.md"}
                >
                  View docs
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );
        },
      },
    ],
    []
  );

  //Tanstack Table config
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [data] = useState(() => [...OtelComponents]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 9 });

  const table = useReactTable({
    data,
    columns,
    filterFns: {},
    state: {
      columnFilters,
      sorting,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const pageIndex = table.getState().pagination.pageIndex;

  return (
    <div className="">
      <div className="border-b border-gray-100 h-22 sm:h-22 md:h-22 min-w-full">
        <h1 className="mb-2 text-xl font-semibold">Collector Components</h1>
      </div>
      <div className="max-h-[70vh] min-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between py-4 space-x-6">
          <Field className="w-72">
            <Label>Search</Label>
            <Input
              placeholder="Filter components..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
            />
          </Field>

          <div className="flex items-center">
            {/* Headless Switch and Label positioned next to the filter input */}
            <FieldHeadless className="flex items-center max-w-80 mr-12">
              <SwitchHeadless
                checked={otelCollector.BuilderConfig.debugMode}
                onChange={handleDebugToggle}
                className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 data-[checked]:bg-blue-600"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
                />
              </SwitchHeadless>
              <LabelHeadless as="span" className="ml-3 text-sm ">
                <span className="font-medium text-gray-900">Debug Mode</span>
                <br />
                <span className="text-gray-500 hidden xl:block">
                  This will automatically add the{" "}
                  <span className="font-semibold">otlp-receiver</span> and{" "}
                  <span className="font-semibold">debug-exporter</span> to get
                  you running asap.
                </span>
              </LabelHeadless>
            </FieldHeadless>
          </div>
        </div>
        <div className="flex-grow overflow-auto">
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHeader key={header.id} colSpan={header.colSpan}>
                        {/* flexRender is responsible for rendering out the value of the column headers */}
                        <div className="flex justify-between items-center">
                          <div className="text-md font-semibold text-gray-700">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                          {header.column.getCanFilter() ? (
                            <div className="ml-2">
                              <Filter column={header.column} />
                            </div>
                          ) : null}
                        </div>
                      </TableHeader>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => {
                return (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      let cellClass = "font-normal"; // Default
                      if (cell.column.id === "name") {
                        cellClass = "font-medium"; // Bold for Name
                      } else if (cell.column.id === "role") {
                        cellClass = "text-zinc-500"; // Zinc for Role
                      }

                      return (
                        <TableCell
                          key={cell.id}
                          className={cellClass + " text-base"}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <Pagination className="mt-8">
          {/* Pagination Previous */}
          <span className="grow basis-0 hover:cursor-pointer">
            <Button
              plain
              aria-label="Previous page"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={`${
                !table.getCanPreviousPage()
                  ? "cursor-not-allowed opacity-50"
                  : "hover:cursor-pointer"
              }`}
            >
              <svg
                className="stroke-current"
                data-slot="icon"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2.75 8H13.25M2.75 8L5.25 5.5M2.75 8L5.25 10.5"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-lg">Previous</p>
            </Button>
          </span>
          {/* End Pagination Previous */}
          {/* Pagination Numbers */}
          <PaginationList>
            {table.getPageCount() > 5 ? (
              <>
                {/* Page 1+2+3 */}
                {[0, 1].map((pageIndex) => (
                  <Button
                    key={pageIndex}
                    aria-label={`Page ${pageIndex + 1}`}
                    aria-current={
                      table.getState().pagination.pageIndex === pageIndex
                        ? "page"
                        : undefined
                    }
                    onClick={() => table.setPageIndex(pageIndex)}
                    plain
                    className={clsx(
                      "min-w-[2.25rem] before:absolute before:-inset-px before:rounded-lg hover:cursor-pointer",
                      table.getState().pagination.pageIndex === pageIndex &&
                        "before:bg-zinc-950/5 dark:before:bg-white/10"
                    )}
                  >
                    {pageIndex + 1}
                  </Button>
                ))}

                {/* Show current page button if it is not the first and last pages  */}
                {pageIndex > 1 &&
                  ![
                    table.getPageCount() - 2,
                    table.getPageCount() - 1,
                  ].includes(pageIndex) && (
                    <Button
                      key={pageIndex}
                      aria-label={`Page ${pageIndex + 1}`}
                      aria-current={
                        pageIndex === table.getState().pagination.pageIndex
                          ? "page"
                          : undefined
                      }
                      onClick={() => table.setPageIndex(pageIndex)}
                      plain
                      className={clsx(
                        "min-w-[2.25rem] before:absolute before:-inset-px before:rounded-lg hover:cursor-pointer",
                        pageIndex === table.getState().pagination.pageIndex &&
                          "before:bg-zinc-950/5 dark:before:bg-white/10"
                      )}
                    >
                      {pageIndex + 1}
                    </Button>
                  )}

                <span className="mx-2">...</span>

                {/* Second Last and Last Page */}
                {[table.getPageCount() - 2, table.getPageCount() - 1].map(
                  (pageIndex) => (
                    <Button
                      key={pageIndex}
                      aria-label={`Page ${pageIndex + 1}`}
                      aria-current={
                        table.getState().pagination.pageIndex === pageIndex
                          ? "page"
                          : undefined
                      }
                      onClick={() => table.setPageIndex(pageIndex)}
                      plain
                      className={clsx(
                        "min-w-[2.25rem] before:absolute before:-inset-px before:rounded-lg hover:cursor-pointer",
                        table.getState().pagination.pageIndex === pageIndex &&
                          "before:bg-zinc-950/5 dark:before:bg-white/10"
                      )}
                    >
                      {pageIndex + 1}
                    </Button>
                  )
                )}
              </>
            ) : (
              // If there are 5 or fewer pages, render all page buttons
              Array.from({ length: table.getPageCount() }).map((_, index) => {
                const current = index === table.getState().pagination.pageIndex;
                return (
                  <Button
                    key={index}
                    aria-label={`Page ${index + 1}`}
                    aria-current={current ? "page" : undefined}
                    onClick={() => table.setPageIndex(index)}
                    plain
                    className={clsx(
                      "min-w-[2.25rem] before:absolute before:-inset-px before:rounded-lg",
                      current && "before:bg-zinc-950/5 dark:before:bg-white/10"
                    )}
                  >
                    {index + 1}
                  </Button>
                );
              })
            )}
          </PaginationList>
          {/* End Pagination Numbers */}
          {/* Pagination Next */}
          <span className="flex grow basis-0 justify-end">
            <Button
              plain
              aria-label="Next page"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={`${
                !table.getCanNextPage()
                  ? "cursor-not-allowed opacity-50"
                  : "hover:cursor-pointer"
              }`}
            >
              <p className="text-lg">Next</p>
              <svg
                className="stroke-current"
                data-slot="icon"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M13.25 8L2.75 8M13.25 8L10.75 10.5M13.25 8L10.75 5.5"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </span>
          {/* End Pagination Next */}
        </Pagination>
      </div>
    </div>
  );
}

declare module "@tanstack/react-table" {
  //allows us to define custom properties for our columns
  /* eslint-disable  @typescript-eslint/no-unused-vars */
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "select";
  }
}

export function Filter({ column }: { column: Column<OtelComponent, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};

  const sortedUniqueValues = useMemo(
    () =>
      Array.from(column.getFacetedUniqueValues().keys()).sort().slice(0, 5000),
    [column.getFacetedUniqueValues(), filterVariant]
  );

  return filterVariant === "select" ? (
    <select
      onChange={(e) => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString()}
    >
      <option value="">All</option>
      {sortedUniqueValues.map((value) => (
        //dynamically generated select options from faceted values feature
        <option value={value} key={value}>
          {value}
        </option>
      ))}
    </select>
  ) : (
    ""
  );
}
