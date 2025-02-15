'use server'

import { revalidatePath } from 'next/cache';


// will revalidate the recipe page
// we will call this whenever someone uses a recipe or generates a configuration
export async function revalidateStatistics() {
  // Invalidate the /posts route in the cache
  revalidatePath('/recipes')
}