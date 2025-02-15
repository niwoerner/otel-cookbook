"use client";
import { Check, Clipboard } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const StyledMarkdown = ({ content }: { content: string }) => {
  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800 mt-6 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <div className="text-gray-600 leading-relaxed mb-4 break-words">
              {children}
            </div>
          ),
          ul: ({ children }) => (
            <ul className="list-disc space-y-2 mb-4 ml-6 text-gray-600">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-2 mb-4 ml-6 text-gray-600">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="break-words leading-relaxed">{children}</li>
          ),
          code: ({ children }) => {
            const content = String(children).trim();
            const isShortCode = content.length < 50 && !content.includes("\n");

            // Maybe there is a better way to handle this - disabling the linting for now
            /* eslint-disable react-hooks/rules-of-hooks */
            const [isCopied, setIsCopied] = useState(false);

            const copyContent = (content: string) => {
              navigator.clipboard.writeText(content).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 1500);
              });
            };

            if (isShortCode) {
              return (
                <code className="px-3 py-1 rounded-md bg-gray-100 text-gray-800 text-sm font-mono">
                  {children}
                </code>
              );
            }

            return (
              <div className="relative">
                <pre className="relative rounded-lg bg-gray-50 border border-gray-200 p-4 pr-12 mb-4 overflow-x-auto">
                  <button
                    onClick={() => copyContent(content)}
                    className="absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Clipboard className="w-4 h-4" />
                    )}
                  </button>
                  <code className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline transition duration-200 break-words"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-200 pl-4 italic my-4 text-gray-600">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-gray-200" />,
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default StyledMarkdown;
