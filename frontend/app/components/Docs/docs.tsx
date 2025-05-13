import Link from "next/link";

export const Docs = () => {
  return (
    <div className="w-full h-full min-h-screen px-2 py-2">
      <div className="max-w-5xl ">
        <header className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl sm:tracking-tight">
            OpenTelemetry Collector Cookbook
          </h1>
          <p className="text-base text-gray-700 mt-4 leading-relaxed">
            <span className="font-bold italic text-sm">
              This project is <span className="text-red-400">not</span>{" "}
              officially affiliated with the CNCF&apos;s OpenTelemetry project
              and was created <span className="text-red-400">just for fun</span>
              . If you have any suggestions/feedback, please
              reach out via an issue in <Link href="https://github.com/niwoerner/otel-cookbook" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Github</Link>.
              <br></br>
              <br></br>
            </span>
            OpenTelemetry provides three default distributions of its collector:
            <strong> Core</strong>, <strong> Contrib</strong>, and{" "}
            <strong> Kubernetes</strong>. Each distribution serves specific use
            cases and offers different advantages.
          </p>
          <p className="text-base text-gray-700 mt-4 leading-relaxed">
            Additionally, OpenTelemetry comes with the{" "}
            <strong>OpenTelemetry Collector Builder (OCB)</strong> tool. It
            allows you to build and debug custom components by creating custom
            collector distributions. This is super useful for extending the
            OpenTelemetry collector, e.g., to observe custom data or just to
            experiment (which can be a lot of fun when you suddenly gain
            observability into your data {"\u{1F61C}"}). For those new to
            OpenTelemetry, creating a custom distribution and running it within
            an IDE, coupled with a debugger, provides a great way to get insight
            how the collector works under the hood.
          </p>
        </header>

        <main className="mt-10">
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              Cook
            </h3>
            <p className="text-base text-gray-700 mt-4 leading-relaxed">
              Getting started with the OpenTelemetry Collector can feel
              overwhelming, especially given that the OpenTelemetry Collector is
              just one part of the larger OpenTelemetry ecosystem, next to SDKs,
              APIs, semantic conventions, and more.
            </p>
            <p className="text-base text-gray-700 mt-4 leading-relaxed">
              The{" "}
              <Link href="/" className="text-blue-600 hover:underline">
                Cook{" "}
              </Link>
              page is designed to help you quickly build your first custom
              OpenTelemetry collector with an easy-to-use, guided UI. To get
              started, you simply need to select{" "}
              <span className="font-semibold">at least one component</span> for
              your custom collector. The page will then generate the build and
              run instructions for you.
            </p>

            <p className="text-base text-gray-700 mt-4 leading-relaxed">
              Refer to the official OpenTelemetry{" "}
              <Link
                href="https://opentelemetry.io/docs/collector/custom-collector/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                documentation{" "}
              </Link>
              for more detailed Information about building a custom collector.
            </p>
          </section>
          <section className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              Recipes
            </h3>
            <p className="text-base text-gray-700 mt-4 leading-relaxed">
              The OpenTelemetry Collector provides a lot of flexibility in how
              it can be configured. Sometimes, you may want to run several
              different collectors (each for a different use case), or you may
              want to fine-tune how data is processed. You can also transform
              your data with the{" "}
              <Link
                className="text-blue-600 hover:underline"
                href="https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/ottl/README.md"
              >
                OpenTelemetry Transformation Language
              </Link>
              .
            </p>
            <p className="text-base text-gray-700 mt-4 leading-relaxed">
              To make it easier for the community to share useful, tested
              components and help others improve and fine-tune their collector
              configuration,{" "}
              <Link className="text-blue-600 hover:underline" href="/recipes">
                recipes
              </Link>{" "}
               provide a way to easily share
              configurations.
              <br></br>
              <br></br>
              If you have any collector configurations you like to use and think
              others could benefit from, please consider sharing them as a recipe.{" "}
              <br />
              <br />
              To add a recipe, all you need to do is open a pull request{" "}
              <Link className="text-blue-600 hover:underline" href="https://github.com/jpkrohling/otelcol-cookbook">
                here
              </Link>{" "}
              - <span className="font-semibold">Thank you</span> in advance! :)
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};
