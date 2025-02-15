"use client";
import { RecipeStatistics } from "@/app/models/recipe.statistics.model";
import { addRecipeReadMeSectionGHRepo, otelBuilderGHRepo } from "@/lib/const";
import { classNames } from "@/lib/utils";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  ColumnDef,
  ColumnFiltersState,
  createColumnHelper,
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
import Link from "next/link";
import { useMemo, useState } from "react";
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
import {
  CollectorConfig,
  OtelCollectorRecipe,
  RecipeType,
} from "../../models/otel.collector.recipes.model";
import Drawer from "./drawer";

const tagStyles: Record<RecipeType, string> = {
  k8s: "text-blue-700 bg-blue-50 ring-blue-600/20",
  ottl: "text-purple-700 bg-purple-50 ring-purple-600/20",
  cicd: "text-orange-700 bg-orange-50 ring-orange-600/20",
  sampling: "text-yellow-800 bg-yellow-50 ring-yellow-600/20",
  observability: "text-red-800 bg-red-50 ring-red-600/20",
  miscellaneous: "text-black-800 bg-black-50 ring-black-600/20",
};

const defaultRecipe: OtelCollectorRecipe = {
  id: "default",
  name: "No Recipe found",
  collectorConfigs: [] as CollectorConfig[],
  description:
    "Something went wrong loading the recipe correctly. Please create a Github issue: " +
    otelBuilderGHRepo,
  images: [],
  author: "unknown",
  lastUpdatedAt: new Date().toISOString(),
  githubRepoUrl: "",
  metadata: {
    type: "miscellaneous",
    recipe_inputs: {
      enabled: false,
      fields: [],
    },
  },
};

export function OtelCollectorRecipeTable({
  OtelCollectorRecipes,
  RecipeStatistics,
}: {
  OtelCollectorRecipes: OtelCollectorRecipe[];
  RecipeStatistics: RecipeStatistics;
}) {
  const stats = [
    { name: "Total Contributers", stat: RecipeStatistics?.totalContributers },
    { name: "Recipes used", stat: RecipeStatistics?.usedRecipes },
    {
      name: "Generated configurations",
      stat: RecipeStatistics?.generatedBuilderConfigs,
    },
  ];

  // Column config
  const columnHelper = createColumnHelper<OtelCollectorRecipe>();
  const [showDrawer, setShowDrawer] = useState(false);
  const [recipe, setRecipe] = useState<OtelCollectorRecipe>(defaultRecipe);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleOnViewDetailsClick = (recepie: OtelCollectorRecipe) => {
    setCurrentImageIndex(0);
    setRecipe(recepie);
    setShowDrawer(true);
  };

  // ToDo: Figure out correct type for any
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const columns = useMemo<ColumnDef<OtelCollectorRecipe, any>[]>(
    () => [
      columnHelper.accessor("name", {
        id: "name",
        sortUndefined: "last",
        header: () => <span>Recipe</span>,
        footer: (info) => info.column.id,
        cell: ({ row }) => {
          return (
            <div>
              <div className="flex items-start gap-x-3">
                <p className="text-lg font-semibold text-gray-900">
                  {row.original.name}
                </p>
                <p
                  className={classNames(
                    tagStyles[row.original.metadata.type],
                    "mt-0.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-sm font-medium ring-1 ring-inset"
                  )}
                >
                  {row.original.metadata.type}
                </p>
              </div>
              <div className="mt-1 flex items-center gap-x-2 text-sm/5 text-gray-500">
                <p className="whitespace-nowrap">
                  Last modified at{" "}
                  <time className="font-semibold" dateTime={"abc"}>
                    {row.original.lastUpdatedAt}
                  </time>
                </p>
                <svg viewBox="0 0 2 2" className="size-0.5 fill-current">
                  <circle r={1} cx={1} cy={1} />
                </svg>
                <p className="truncate">
                  Updated by{" "}
                  <Link
                    href={`https://github.com/${row.original.author}`}
                    target="_blank"
                  >
                    <span
                      className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition duration-200 ease-in-out cursor-pointer"
                      rel="noopener noreferrer"
                    >
                      {row.original.author}
                    </span>
                  </Link>
                </p>
              </div>
            </div>
          );
        },
        meta: {
          filterVariant: "select",
        },
      }),
      columnHelper.accessor("author", {
        id: "author",
        sortUndefined: "last",
        header: () => <span>Author</span>,
        footer: (info) => info.column.id,
        cell: ({ row }) => {
          return (
            <Link
              href={`https://github.com/${row.original.author}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline font-semibold transition duration-200 ease-in-out"
            >
              {row.original.author}
            </Link>
          );
        },
      }),
      {
        id: "actions",
        cell: ({ row }) => {
          const recipe = row.original;

          return (
            <div className="flex justify-end items-center px-12">
              <button
                type="button"
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                onClick={() => handleOnViewDetailsClick(recipe)}
              >
                View Details
              </button>
            </div>
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
  const [data] = useState(() => [...OtelCollectorRecipes]);
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
      <div className=" pb-8 ">
        <h1 className="text-2xl font-semibold text-gray-900">Statistics</h1>
        <dl className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.name}
              className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
            >
              <dt className="truncate text-sm font-medium text-gray-500">
                {item.name}
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {item.stat}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <h1 className="mb-1 mt-3 text-2xl font-semibold  ">
        Otel Collector Recipes 🍜
      </h1>

      <div className="max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between py-4 space-x-6">
          <Field className="w-72">
            <Label>Search</Label>
            <Input
              placeholder="Filter recipes..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
            />
          </Field>
          <div className="px-10">
            <button
              type="button"
              className="bg-blue-600 flex items-center gap-x-2 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out h-10 ml-4"
              onClick={() =>
                window.open(addRecipeReadMeSectionGHRepo, "_blank")
              }
            >
              Add Recipe
              <PlusIcon aria-hidden="true" className="w-5 h-5" />
            </button>
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
                          <div className="text-sm font-semibold text-gray-700">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
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
                      return (
                        <TableCell key={cell.id}>
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
          <span className="grow basis-0">
            <Button
              plain
              aria-label="Previous page"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
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
                      "min-w-[2.25rem] before:absolute before:-inset-px before:rounded-lg",
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
                        "min-w-[2.25rem] before:absolute before:-inset-px before:rounded-lg",
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
                        "min-w-[2.25rem] before:absolute before:-inset-px before:rounded-lg",
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
      <Drawer
        recipeDetails={recipe}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
        showDrawer={showDrawer}
        setShowDrawer={setShowDrawer}
      />
    </div>
  );
}
