"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface CollectorConfigWarningPopupProps {
  heading: string;
  type: "warning" | "error" | "success";
  description: string;
  buttonText: string;
  allowContinue?: boolean;
  onContinue?: () => void;
  continueButtonText?: string;
  open: boolean;
  setOpenPopup: React.Dispatch<React.SetStateAction<boolean>>;
  missingInBuilderConfig?: Record<string, string[]>;
  missingInCollectorConfig?: Record<string, string[]>;
}

export default function CollectorConfigWarningPopup({
  open,
  setOpenPopup,
  heading,
  description,
  type,
  buttonText,
  continueButtonText,
  allowContinue,
  onContinue,
  missingInBuilderConfig,
  missingInCollectorConfig,
}: CollectorConfigWarningPopupProps) {
  let icon;
  let textColor;

  const iconSize = "size-6";
  if (type === "warning") {
    textColor = "text-orange-400";
    icon = <ExclamationTriangleIcon className={`${iconSize} ${textColor}`} />;
  } else if (type === "error") {
    textColor = "text-red-400";
    icon = <ExclamationTriangleIcon className={`${iconSize} ${textColor}`} />;
  } else if (type === "success") {
    textColor = "text-green-400";
    icon = <CheckCircleIcon className={`${iconSize} ${textColor}`} />;
  }

  return (
    <Dialog open={open} onClose={setOpenPopup} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100">
                {icon}
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold text-gray-900"
                >
                  {heading}
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{description}</p>

                  {/* Display missing components if provided */}
                  {missingInCollectorConfig &&
                    Object.keys(missingInCollectorConfig).length > 0 && (
                      <div className="mt-3">
                        <div className="mt-1 rounded-md bg-gray-50 p-2">
                          <p className="text-sm font-semibold text-gray-700">
                            Missing Components:
                          </p>
                          {Object.entries(missingInCollectorConfig).map(
                            ([type, components]) => (
                              <MissingComponentsList
                                key={`collector-${type}`}
                                components={components}
                                type={type}
                              />
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {missingInBuilderConfig &&
                    Object.keys(missingInBuilderConfig).length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-gray-700">
                          Missing Components:
                        </p>
                        <div className="mt-1 rounded-md bg-gray-50 p-2">
                          {Object.entries(missingInBuilderConfig).map(
                            ([type, components]) => (
                              <MissingComponentsList
                                key={`builder-${type}`}
                                components={components}
                                type={type}
                              />
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 space-y-4">
              <button
                type="button"
                onClick={() => setOpenPopup(false)}
                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-inset ring-1 ${
                  allowContinue
                    ? "bg-white text-black-600 ring-gray-300 hover:bg-gray-50"
                    : "bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600"
                }`}
              >
                {buttonText}
              </button>
              {allowContinue && (
                <button
                  type="button"
                  onClick={onContinue}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  {continueButtonText}
                </button>
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

function MissingComponentsList({
  components,
  type,
}: {
  components: string[];
  type: string;
}) {
  return (
    <div className="mt-3">
      <div className="mt-4">
        <div className="mb-2 flex items-center space-x-2">
          <h2 className="text-sm font-semibold text-gray-700">{type}</h2>
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            {components.length}
          </span>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
          <ul className="divide-y divide-gray-100">
            {components.map((component) => (
              <li
                key={component}
                className="py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {component}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
