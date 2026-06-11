import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { userAPI } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const OwnerSettings = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await userAPI.updateProfile(form);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <Label>Name</Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter name"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          <Button className="bg-emerald-600 hover:bg-emerald-700">
            Save Changes
          </Button>

        </form>
      </div>
    </DashboardLayout>
  );
};

export default OwnerSettings;