"use client";
import { Transition } from "@headlessui/react";
import {
  ExclamationCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import React from "react";

interface NotificationProps {
  type: "warning" | "error" | "success";
  heading: string;
  description: string;
  showNotification: boolean;
  setShowNotification: React.Dispatch<React.SetStateAction<boolean>>;
}

const Notification = ({
  type,
  heading,
  description,
  showNotification,
  setShowNotification,
}: NotificationProps) => {
  let icon;
  let textColor;

  const iconSize = "size-6";
  if (type === "warning") {
    textColor = "text-orange-400";
    icon = <ExclamationCircleIcon className={`${iconSize} ${textColor}`} />;
  } else if (type === "error") {
    textColor = "text-red-400";
    icon = <ExclamationCircleIcon className={`${iconSize} ${textColor}`} />;
  } else if (type === "success") {
    textColor = "text-green-400";
    icon = <CheckCircleIcon className={`${iconSize} ${textColor}`} />;
  }

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        <Transition show={showNotification}>
          <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5 transition data-[closed]:data-[enter]:translate-y-2 data-[enter]:transform data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:data-[enter]:sm:translate-x-2 data-[closed]:data-[enter]:sm:translate-y-0">
            <div className="p-4">
              <div className="flex items-start">
                <div className="shrink-0">{icon}</div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className={`text-sm font-medium`}>{heading}</p>
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>
                <div className="ml-4 flex shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowNotification(false)}
                    className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon aria-hidden="true" className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
};

export default Notification;
