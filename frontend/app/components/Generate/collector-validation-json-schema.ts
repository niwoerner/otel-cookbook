/**
 * Acknowledgment:
 * 
 * This code was taken by the work done by the Dash0 team in their 
 * OpenTelemetry Bin (otelbin) project. 
 * 
 * Original source: https://github.com/dash0hq/otelbin/blob/main/packages/otelbin/src/components/monaco-editor/JSONSchema.ts#L30
 * 
 * All credit goes to their effort in building and maintaining otelbin. https://www.otelbin.io/
 */


import {JSONSchemaType } from "ajv";

export interface IPipeline {
	receivers: string[];
	processors?: string[];
	exporters: string[];
}

export interface IPipelines {
	[name: string]: IPipeline;
}

export interface IService {
	pipelines: IPipelines;
}

export interface IOtelConfig {
	receivers: object;
	processors: object;
	exporters: object;
	extensions: object;
	service: IService;
	connectors: object;
}

// @ts-expect-error TypeScript cannot correctly correlate the schema with the TypeScript types.
export const schema: JSONSchemaType<IOtelConfig> = {
	$schema: "http://json-schema.org/draft-07/schema#",
	$id: "https://dash0.com/otelcollector.json",
	title: "OpenTelemetry Collector Configuration",
	description: "OpenTelemetry Collector Configuration",
	type: "object",
	properties: {
		receivers: {
			type: "object",
			additionalProperties: true,
			errorMessage: {
				type: "The 'receivers' entry must be a map, see https://opentelemetry.io/docs/collector/configuration/#receivers",
			},
		},
		processors: {
			type: "object",
			additionalProperties: true,
			errorMessage: {
				type: "The 'processors' entry must be a map, see https://opentelemetry.io/docs/collector/configuration/#processors",
			},
		},
		exporters: {
			type: "object",
			additionalProperties: true,
			errorMessage: {
				type: "The 'exporters' entry must be a map, see https://opentelemetry.io/docs/collector/configuration/#exporters",
			},
		},
		extensions: {
			type: "object",
			additionalProperties: true,
			errorMessage: {
				type: "The 'extensions' entry must be a map, see https://opentelemetry.io/docs/collector/configuration/#extensions",
			},
		},
		service: {
			type: "object",
			additionalProperties: true,
			properties: {
				pipelines: {
					type: "object",
					additionalProperties: {
						type: "object",
						properties: {
							receivers: {
								type: "array",
								minItems: 1,
								errorMessage: {
									minItems:
										"The pipeline must reference at least one receiver, see https://opentelemetry.io/docs/collector/configuration/#pipelines",
								},
							},
							processors: {
								type: "array",
							},
							exporters: {
								type: "array",
								minItems: 1,
								errorMessage: {
									minItems:
										"The pipeline must reference at least one exporter, see https://opentelemetry.io/docs/collector/configuration/#pipelines",
								},
							},
						},
						required: ["receivers", "exporters"],
						errorMessage: {
							required: {
								receivers:
									"The pipeline must reference at least one receiver, see https://opentelemetry.io/docs/collector/configuration/#pipelines",
								exporters:
									"The pipeline must reference at least one exporter, see https://opentelemetry.io/docs/collector/configuration/#pipelines",
							},
						},
					},
					errorMessage: {
						type: "The 'pipeline' entry must be a map, see https://opentelemetry.io/docs/collector/configuration/#pipelines",
					},
				},
			},
			required: ["pipelines"],
			errorMessage: {
				required:
					"At least one pipeline must be specified, see https://opentelemetry.io/docs/collector/configuration/#pipelines",
				type: "The 'pipeline' entry must be a map, see https://opentelemetry.io/docs/collector/configuration/#pipelines",
			},
		},
		connectors: {
			type: "object",
			additionalProperties: true,
			errorMessage: {
				type: "The 'connectors' entry must be a map, see https://opentelemetry.io/docs/collector/configuration/#connectors",
			},
		},
	},
	errorMessage: {
		type: "The configuration must be a map, see https://opentelemetry.io/docs/collector/configuration",
		required:
			"The configuration must specify at least the 'receivers', 'exporters', and 'service' entries, see https://opentelemetry.io/docs/collector/configuration",
	},
	required: ["service", "receivers", "exporters"],
};
