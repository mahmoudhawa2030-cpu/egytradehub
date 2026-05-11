// Stubs for static export build - original file moved to actions.ts.disabled
// These functions return mock data for the mobile build

export async function createProduct(formData: FormData) {
  console.log("createProduct stub called");
  return { success: true } as { success: true } | { error: string };
}

export async function updateProduct(productId: string, formData: FormData) {
  console.log("updateProduct stub called");
  return { success: true } as { success: true } | { error: string };
}

export async function deleteProduct(productId: string): Promise<void> {
  console.log("deleteProduct stub called");
}

export async function getSuppliers() {
  return [];
}

export async function getCategories() {
  return [];
}

export async function createCategory(formData: FormData) {
  return { success: true } as { success: true } | { error: string } | { category: any };
}

export async function updateCategory(categoryId: string, formData: FormData) {
  return { success: true } as { success: true } | { error: string } | { category: any };
}

export async function deleteCategory(categoryId: string) {
  return { success: true };
}

export async function updateRFQStatus(rfqId: string, status: string) {
  return { success: true };
}

export async function deleteUser(userId: string) {
  return { success: true };
}

export async function updateUser(userId: string, formData: FormData) {
  return { success: true };
}

export async function createUser(formData: FormData) {
  return { success: true };
}

// Additional stubs for imports from admin pages

export async function verifySupplier(userId: string): Promise<void> {}

export async function rejectSupplier(userId: string): Promise<void> {}

export async function suspendUser(userId: string): Promise<void> {}

export async function banUser(userId: string) {
  return { success: true };
}

export async function unbanUser(userId: string) {
  return { success: true };
}

export async function updateUserProfile(userId: string, data: any) {
  return { success: true } as { success: true } | { error: string };
}

export async function createAdminUser(formData: FormData) {
  return { success: true } as { success: true } | { error: string };
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {}

export async function updateRfqStatus(rfqId: string, status: string): Promise<void> {}

export async function uploadCategoryThumbnail(formData: FormData) {
  // Stub returns empty url - use type assertion to bypass TS narrowing
  return { url: "" } as { url: string } | { error: string };
}

export async function toggleCategoryActive(categoryId: string, isActive: boolean) {
  return { success: true };
}

export async function uploadProductImage(formData: FormData) {
  // Stub: ignore actual upload, just return a fake URL shape that matches callers
  return { url: "" } as { url: string } | { error: string };
}
