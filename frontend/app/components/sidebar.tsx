"use client";

import { otelBuilderGHRepo } from "@/lib/const";
import { classNames } from "@/lib/utils";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import {
  Bars3Icon,
  DocumentDuplicateIcon,
  FolderIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

const navigationItems = [
  { name: "Generate", href: "/", icon: WrenchScrewdriverIcon },
  { name: "Recipes", href: "/recipes", icon: FolderIcon },
  { name: "Docs", href: "/docs", icon: DocumentDuplicateIcon },
];

type PageProps = {
  DashboardContent: React.ReactNode;
};

export default function DashboardSidebar({ DashboardContent }: PageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getCurrentPath = () => {
    if (typeof window !== "undefined") {
      return window.location.pathname;
    }
    return "/";
  };

  const [navigation, setNavigation] = useState(
    navigationItems.map((item) => ({
      ...item,
      current: false,
    }))
  );

  useEffect(() => {
    const currentPath = getCurrentPath();

    setNavigation(
      navigationItems.map((item) => ({
        ...item,
        current:
          item.href === "/"
            ? currentPath === item.href
            : currentPath.startsWith(item.href),
      }))
    );
  }, []);

  return (
    <>
      <div>
        <Dialog
          open={sidebarOpen}
          onClose={setSidebarOpen}
          className="relative z-50 lg:hidden"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0  bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="fixed inset-0 mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="-m-2.5 p-2.5"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon
                      aria-hidden="true"
                      className="size-6 text-white"
                    />
                  </button>
                </div>
              </TransitionChild>
              {/* Sidebar component */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                <div
                  className="flex h-16 shrink-0 items-center  hover:cursor-pointer"
                  onClick={() => {
                    redirect("/");
                  }}
                >
                  <Image
                    src="/opentelemetry-logo.svg"
                    width={30}
                    height={30}
                    alt="OpenTelemetry Logo"
                  />
                  <h1 className="pl-2 items-center text-xl font-semibold text-gray-900">
                    Otel {""}
                    <span className="text-[#ffaf00]">Cook</span>
                    <span className="text-[#425cc7]">book</span>
                  </h1>
                </div>
                <div className="border-b border-gray-200 -mx-6 px-6 -mt-4"></div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <a
                              href={item.href}
                              className={classNames(
                                item.current
                                  ? "bg-gray-50 text-blue-600"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
                                "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                              )}
                              onClick={(e) => {
                                if (item.href === "#") {
                                  e.preventDefault();
                                }
                                setNavigation(
                                  navigation.map((nav) => ({
                                    ...nav,
                                    current: nav.name === item.name,
                                  }))
                                );
                              }}
                            >
                              <item.icon
                                aria-hidden="true"
                                className={classNames(
                                  item.current
                                    ? "text-blue-600"
                                    : "text-gray-400 group-hover:text-blue-600",
                                  "size-6 shrink-0"
                                )}
                              />
                              {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li></li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-49 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r  border-gray-200  px-6 ">
            <div
              className="flex h-16 shrink-0 items-center hover:cursor-pointer "
              onClick={() => {
                redirect("/");
              }}
            >
              <Image
                src="/opentelemetry-logo.svg"
                width={30}
                height={30}
                alt="Picture of the author"
              />
              <h1 className="pl-2 items-center text-xl font-semibold text-gray-900">
                Otel {""}
                <span className="text-[#ffaf00]">Cook</span>
                <span className="text-[#425cc7]">book</span>
              </h1>
            </div>
            <div className="border-b border-gray-200 -mx-6 px-6 -mt-4 "></div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-gray-50 text-blue-600"
                              : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
                            "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                          )}
                          onClick={(e) => {
                            if (item.href === "#") {
                              e.preventDefault();
                            }
                            setNavigation(
                              navigation.map((nav) => ({
                                ...nav,
                                current: nav.name === item.name,
                              }))
                            );
                          }}
                        >
                          <item.icon
                            aria-hidden="true"
                            className={classNames(
                              item.current
                                ? "text-blue-600"
                                : "text-gray-400 group-hover:text-blue-600",
                              "size-6 shrink-0"
                            )}
                          />
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                <li></li>
                <li className="-mx-6 mt-auto border-t  border-gray-200 ">
                  <a
                    href={otelBuilderGHRepo}
                    className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-github size-8 rounded-full"
                    >
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                    <span className="text-lg" aria-hidden="true">
                      View on GitHub
                    </span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
          <div className="flex-1 text-sm/6 font-semibold text-gray-900"></div>
          <a href={otelBuilderGHRepo}>
            <span className="sr-only">Your profile</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-github size-8 rounded-full"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
        </div>

        <main className="pb-8 pt-4 lg:pl-72">
          <div className="px-4 sm:px-6 lg:px-8">{DashboardContent}</div>
        </main>
      </div>
    </>
  );
}
