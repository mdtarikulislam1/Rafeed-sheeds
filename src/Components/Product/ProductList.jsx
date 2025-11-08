import { useEffect, useState } from "react";
import { FaPlus, FaTag } from "react-icons/fa";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import openCloseStore from "../../Zustand/OpenCloseStore";
import api from "../../Helper/Axios_Response_Interceptor";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { setGlobalLoader } = loadingStore();
  const { setCategoryModal } = openCloseStore();

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [packSize, setPackSize] = useState(["KG", "Gram"]);
  const [selectedPackSize, setSelectedPackSize] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    categoryID: "",
    SubCategoryID: "",
    stock: "",
    dp: "",
    sp: "",
    barcode: "",
    weight: "",
  });

  // ============================
  // Fetch Products
  // ============================
  const fetchProducts = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/ProductList/${page}/${limit}/${search || 0}`);
      if (res.data.status === "Success") {
        setProducts(res.data.data || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      ErrorToast("Failed to load products");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  // ============================
  // Fetch Categories
  // ============================
  const fetchDropdownData = async () => {
    try {
      const res = await api.get(`/GetCategory`);
      setCategories(res.data.data || []);
    } catch (error) {
      ErrorToast("Failed to load dropdown data");
      console.error(error);
    }
  };

  // ============================
  // Fetch SubCategory by CategoryID
  // ============================
  const handleCategoryChange = async (categoryID) => {
    setFormData((prev) => ({ ...prev, categoryID, SubCategoryID: "" }));

    if (!categoryID) {
      setSubCategories([]);
      return;
    }

    try {
      const res = await api.get(`/GetSubCategoryByCategoryID/${categoryID}`);
      if (res.data.status === "Success") {
        setSubCategories(res.data.data);
      } else {
        setSubCategories([]);
      }
    } catch (error) {
      console.error(error);
      setSubCategories([]);
    }
  };

  // ============================
  // Handlers
  // ============================
  const handleSearch = (e) => {
    const keyword = e.target.value;
    setSearch(keyword);
    setPage(1);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumberInput = (field, value, isInteger = false) => {
    const pattern = isInteger ? /^\d*$/ : /^\d*\.?\d*$/;
    if (value === "" || pattern.test(value)) {
      handleInputChange(field, value);
    }
  };

  // ============================
  // Validation
  // ============================
  const validateForm = () => {
    if (!formData.name.trim()) return ErrorToast("Product name is required");
    if (!formData.categoryID) return ErrorToast("Please select a category");
    // if (!formData.SubCategoryID)
    //   return ErrorToast("Please select a sub category");
    if (!formData.weight) return ErrorToast("Please Enter Pack Size");
    if (!selectedPackSize) return ErrorToast("No Pack Size Selected");
    return true;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      categoryID: "",
      SubCategoryID: "",
      stock: "",
      dp: "",
      sp: "",
      barcode: "",
      weight: "",
    });
    setIsCreateMode(false);
    setEditingProduct(null);
    setSelectedPackSize("");
    setSubCategories([]);
  };

  // Handle create product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name.trim(),
      categoryID: formData.categoryID,
      SubCategoryID: formData.SubCategoryID ? formData.SubCategoryID : null,
      stock: formData.stock ? parseInt(formData.stock) : 0,
      weight: formData.weight
        ? selectedPackSize === "KG"
          ? parseFloat(formData.weight) * 1000
          : parseFloat(formData.weight)
        : 0,
      price: formData.dp ? parseFloat(formData.dp) : 0,
      sp: formData.sp ? parseFloat(formData.sp) : 0,
      barcode: formData.barcode.trim(),
    };

    try {
      setGlobalLoader(true);
      const res = await api.post(`/CreateProduct`, payload);

      if (res.data.status === "Success") {
        SuccessToast("Product created successfully!");
        resetForm();
        fetchProducts();
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Failed to create product");
    } finally {
      setGlobalLoader(false);
    }
  };

  // ============================
  // Handle Update Product
  // ============================
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!editingProduct?._id)
      return ErrorToast("No product selected to update");

    const payload = {
      name: formData.name.trim(),
      SubCategoryID:formData.SubCategoryID || null,
      categoryID: formData.categoryID,
      unitID: formData.unitID || editingProduct.unitID || null, // যদি formData তে unit থাকে
      stock: formData.stock ? parseInt(formData.stock) : 0,
      unitCost: formData.unitCost ? parseFloat(formData.unitCost) : 0,
      price: formData.dp ? parseFloat(formData.dp) : 0,
      sp: formData.sp ? parseFloat(formData.sp) : 0,
    };

    console.log("Update URL:", `/UpdateProduct/${editingProduct._id}`);
    console.log("Payload Sent:", payload);

    try {
      setGlobalLoader(true);
      const res = await api.put(
        `/UpdateProduct2/${editingProduct._id}`,
        payload
      );

      if (res.data.status === "Success") {
        SuccessToast("Product updated successfully!");
        resetForm();
        fetchProducts();
      } else {
        ErrorToast(res.data.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Update error:", error);
      ErrorToast(error.response?.data?.message || "Server error during update");
    } finally {
      setGlobalLoader(false);
    }
  };

  // // ============================
  // // Edit Product
  // // ============================
  const startEditProduct = async (product) => {
    setFormData({
      name: product.name || "",
      categoryID: product.Categorys?._id || product.categoryID || "",
      SubCategoryID: product.SubCategorys?._id || product.SubCategoryID || "",
      stock: product.stock?.toString() || "",
      dp: product.price?.toString() || "",
      sp: product.sp?.toString() || "",
      barcode: product.barcode || "", 
      weight:
        product.weight >= 1000 ? product.weight / 1000 : product.weight || "",
      unitID: product.unitID || "",
      unitCost: product.unitCost?.toString() || "",
    });

    // Auto-load subcategories
    if (product.Categorys?._id || product.categoryID) {
      await handleCategoryChange(product.Categorys?._id || product.categoryID);
    }

    setSelectedPackSize(product.weight >= 1000 ? "KG" : "Gram");
    setEditingProduct(product);
    setIsCreateMode(true);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([fetchProducts(), fetchDropdownData()]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchAllData();
  }, [page, search, limit]);

  // console.log(products);

  // Render
  return (
    <div className="global_container">
      <div className="global_sub_container">
        <form
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Product Name */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="global_input w-full"
                placeholder="Enter product name"
              />
            </div>

            {/* Pack Size */}
            <div className="col-span-2 flex flex-col md:flex-row gap-3">
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium mb-1">
                  Pack Size
                </label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => handleNumberInput("weight", e.target.value)}
                  className="global_input w-full"
                  placeholder="0.00"
                />
              </div>

              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium mb-1">Unit</label>
                <select
                  value={selectedPackSize}
                  onChange={(e) => setSelectedPackSize(e.target.value)}
                  className="global_dropdown w-full"
                >
                  <option value="">Select</option>
                  {packSize.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium mb-1">
                  <FaTag className="inline mr-1" />
                  Category *
                </label>
                <select
                  value={formData.categoryID}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="global_dropdown w-full"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sub Category */}
            {subCategories.length > 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium mb-1">
                  Sub Category *
                </label>
                <select
                  value={formData.SubCategoryID}
                  onChange={(e) =>
                    handleInputChange("SubCategoryID", e.target.value)
                  }
                  className="global_dropdown w-full"
                >
                  <option value="">Select Sub Category</option>
                  {subCategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sell Price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Sell Price
              </label>
              <input
                type="text"
                value={formData.dp}
                onChange={(e) => handleNumberInput("dp", e.target.value)}
                className="global_input w-full"
                placeholder="0.00"
              />
            </div>

            {/* Special Price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Special Price
              </label>
              <input
                type="text"
                value={formData.sp}
                onChange={(e) => handleNumberInput("sp", e.target.value)}
                className="global_input w-full"
                placeholder="0.00"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="text"
                value={formData.stock}
                onChange={(e) =>
                  handleNumberInput("stock", e.target.value, true)
                }
                className="global_input w-full"
                placeholder="0"
              />
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm font-medium mb-1">Barcode</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => handleInputChange("barcode", e.target.value)}
                className="global_input w-full"
                placeholder="Enter barcode"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button type="submit" className="global_button">
              {editingProduct ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="global_sub_container">
        <div className="py-2">
          <div className="flex flex-col gap-2 lg:flex-row justify-between lg:items-center">
            <h2 className="text-xl font-semibold flex flex-col">
              Products List{" "}
              <span className="text-sm">Showing of {total} products</span>
            </h2>

            <div className="relative w-full lg:w-lg">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={handleSearch}
                className="global_input"
              />
            </div>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1);
              }}
              className="global_dropdown lg:w-fit"
            >
              {[20, 50, 100, 200].map((opt) => (
                <option key={opt} value={opt}>
                  {opt} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        {products.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="global_table">
                <thead className="global_thead">
                  <tr className="">
                    <th className="global_th">No</th>
                    <th className="global_th">Name</th>
                    <th className="global_th">Category</th>
                    <th className="global_th">Stock</th>

                    <th className="global_th">Sell Price</th>
                    <th className="global_th">Special Price</th>

                    <th className="global_th">Barcode</th>
                    <th className="global_th">action</th>
                  </tr>
                </thead>
                <tbody className="global_tbody">
                  {products.map((product, index) => (
                    <tr className="global_tr" key={product._id}>
                      <td className="global_td">{index + 1}</td>
                      <td className="global_td">
                        {product.name}{" "}
                        {product.weight && (
                          <span className="text-xs text-green-400">
                            (
                            {product.weight >= 1000
                              ? product.weight / 1000 + " KG"
                              : product.weight + " Gram"}
                            )
                          </span>
                        )}
                      </td>
                      <td className="global_td">
                        {product.Categorys?.name || "N/A"}
                      </td>
                      <td className="global_td">
                        {parseInt(product.stock || 0)}{" "}
                        {product.weight && (
                          <span className="text-xs text-green-400">
                            (
                            {product.weight >= 1000
                              ? product.weight / 1000 + " KG"
                              : product.weight + " Gram"}
                            )
                          </span>
                        )}
                      </td>

                      <td className="global_td">
                        {parseFloat(product.price || 0).toFixed(2)}
                      </td>
                      <td className="global_td">
                        {parseFloat(product.sp || 0).toFixed(2)}
                      </td>

                      <td className="global_td">{product.barcode || "N/A"}</td>
                      <td className="global_td">
                        <button
                          onClick={() => startEditProduct(product)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


            {/* Pagination */}
            {total > 0 && (
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-r-md rounded-l-full ${
                    page === 1
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "global_button"
                  }`}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {page} of {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  className={`px-4 py-2 rounded-l-md rounded-r-full ${
                    page >= Math.ceil(total / limit)
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "global_button"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
