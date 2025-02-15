"use client";
import { yaml } from "@codemirror/lang-yaml";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { CogIcon } from "@heroicons/react/24/outline";
import { dracula } from "@uiw/codemirror-theme-dracula";
import CodeMirror from "@uiw/react-codemirror";
import { Check, Clipboard } from "lucide-react";
import React from "react";
import { Button } from "../../../components/button";

interface CollectorConfigPopupWizardProps {
  collectorConfig: string;
  openPopup: boolean;
  setOpenPopup: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CollectorConfigPopupWizard({
  collectorConfig,
  openPopup,
  setOpenPopup,
}: CollectorConfigPopupWizardProps) {
  const [isCopied, setIsCopied] = React.useState(false);
  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    });
  };

  return (
    <Dialog open={openPopup} onClose={setOpenPopup} className="relative z-10 ">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-4xl sm:p-8 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="max-w-3xl mx-auto">
              <div className="w-full flex justify-end">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6 hover:cursor-pointer"
                  onClick={() => setOpenPopup(false)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-blue-100">
                <CogIcon aria-hidden="true" className="size-8 text-blue-600" />
              </div>

              <div className="mt-4 text-center sm:mt-6 max-h-[58vh] lg:max-h-[78vh] overflow-auto">
                <DialogTitle
                  as="h3"
                  className="text-xl font-semibold leading-6 text-gray-900"
                >
                  Collector Configuration
                </DialogTitle>

                <div className="mt-8 text-left">
                  <h4 className="text-lg font-medium text-gray-900">
                    YAML Configuration
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                    You can view the collector configuration of the recipe
                    below.
                  </p>
                  <div className="mt-4">
                    <div className="relative rounded-lg border border-gray-500 p-2 bg-gray-800 min-h-[239px] md:min-h-[439px]">
                      <CodeMirror
                        value={collectorConfig}
                        extensions={[yaml()]}
                        className="rounded-md border-none p-3 text-gray-200 font-mono text-sm bg-transparent"
                        theme={dracula}
                        readOnly
                        editable={false}
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-zinc-700 bg-transparent"
                          onClick={() => copyContent(collectorConfig)}
                        >
                          {isCopied ? (
                            <Check color="#4ade80" />
                          ) : (
                            <Clipboard color="#fff" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
