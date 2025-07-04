import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { addCustomer } from "@/services/wifi";

export default function AddCustomerForm() {
  const initialData = {
    name: "",
    contactNumber: "",
    MonthlyFee: "",
    speed: "",
    userIp: "",
    userName: "",
    password: "",
    location: "",
    sender: "",
    dealer: "",
  };

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) {
        if(key == 'dealer'){return}
        newErrors[key] = "هذا الحقل مطلوب";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setSubmitError("");

    if (!validateFields()) return;

    setLoading(true);

    try {
        console.log(formData)
        const res = await addCustomer(formData)
      if (res.success) {
        setSuccessMessage("✅ تم إرسال البيانات بنجاح");
        setFormData(initialData);
        window.location.reload()
      } else {
        setSubmitError("❌ فشل الإرسال: ");
      }
    } catch (error) {
      setSubmitError("⚠️ حدث خطأ أثناء الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-md">

      {successMessage && (
        <p className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-right mb-4">
          {successMessage}
        </p>
      )}
      {submitError && (
        <p className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-right mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {submitError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* الاسم ورقم الاتصال */}
        <div className="grid md:grid-cols-2 gap-6">
          <FormInput id="name" label="الاسم" value={formData.name} onChange={handleChange} error={errors.name} />
          <FormInput id="contactNumber" label="رقم الاتصال" type="number" value={formData.contactNumber} onChange={handleChange} error={errors.contactNumber} />
        </div>

        {/* الفاتورة وسرعة الاشتراك */}
        <div className="grid md:grid-cols-2 gap-6">
          <FormInput id="MonthlyFee" label="الفاتورة الشهرية" type="number" value={formData.MonthlyFee} onChange={handleChange} error={errors.MonthlyFee} />
          <FormInput id="speed" label="سرعة الاشتراك" type="number" value={formData.speed} onChange={handleChange} error={errors.speed} />
        </div>

        {/* IP واسم المستخدم */}
        <div className="grid md:grid-cols-2 gap-6">
          <FormInput id="userIp" label="User IP" value={formData.userIp} onChange={handleChange} error={errors.userIp} />
          <FormInput id="userName" label="اسم المستخدم" value={formData.userName} onChange={handleChange} error={errors.userName} />
        </div>

        {/* كلمة السر */}
        <FormInput id="password" label="كلمة السر" type="password" value={formData.password} onChange={handleChange} error={errors.password} />

        {/* الموقع والمرسل */}
        <div className="grid md:grid-cols-2 gap-6">
          <FormInput id="location" label="الموقع" value={formData.location} onChange={handleChange} error={errors.location} />
          <FormInput id="sender" label="المرسل" value={formData.sender} onChange={handleChange} error={errors.sender} />
        </div>

        {/* البائع */}
        <div className="grid md:grid-cols-2 gap-6">
          <FormInput id="dealer" label="البائع" value={formData.dealer} onChange={handleChange} error={errors.dealer} />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3 rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              "إرسال"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FormInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div className="text-right">
      <label htmlFor={id} className="block mb-1 text-sm font-medium text-gray-700">
        {label}
      </label>
      <Input
        name={id}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`text-right border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
          error ? "border-red-500" : ""
        }`}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
