import { ComponentType, OtelCollector, OtelComponent } from "@/app/models/otel.builder.config.model";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

// helper function to update components array without duplicates
export const updateComponents = (
  components: OtelComponent[],
  component: OtelComponent,
  shouldAdd: boolean
): OtelComponent[] => {
  if (shouldAdd) {
    const exists = components.some(comp => 
      comp.type === component.type && comp.name === component.name
    )
    return exists ? components : [...components, component]
  } else {
    return components.filter(comp => 
      !(comp.type === component.type && comp.name === component.name)
    )
  }
}

// helper function to update collector state for a specific component type
export const updateCollectorState = (
  prevState: OtelCollector,
  componentType: ComponentType,
  component: OtelComponent,
  shouldAdd: boolean
): OtelCollector => {
  const componentArrayKey = `${componentType}s` as keyof OtelCollector
  return {
    ...prevState,
    [componentArrayKey]: updateComponents(
      prevState[componentArrayKey] as OtelComponent[],
      component,
      shouldAdd
    )
  }
}
