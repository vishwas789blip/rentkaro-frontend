import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { userAPI } from "@/services/userApi";
import { reviewAPI } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Star,
  Edit3,
  Save,
  X,
  ArrowLeft,
  MessageSquare,
  Settings,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          userAPI.getProfile(),
          reviewAPI.getUserReviews(),
        ]);
        const user = profileRes.data?.data?.user;
        setProfile(user);
        setFormName(user?.name || "");
        setFormEmail(user?.email || "");
        setReviews(reviewsRes.data?.data || []);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      setSaving(true);
      await userAPI.updateProfile({ name: formName, email: formEmail });
      setProfile((prev) => (prev ? { ...prev, name: formName, email: formEmail } : prev));
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-6 py-20 text-center text-muted-foreground">
          Loading profile...
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-lg text-muted-foreground">Could not load profile.</p>
        </div>
      </MainLayout>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        {/* Header Card */}
        <div className="rounded-2xl border bg-card p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-full bg-brand/10 flex items-center justify-center text-brand text-2xl font-bold shrink-0">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
              <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                <Mail className="h-4 w-4" />
                {profile.email}
              </p>
              <span className="inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full bg-brand/10 text-brand capitalize">
                {profile.role}
              </span>
            </div>

            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="shrink-0"
              >
                <Edit3 className="h-4 w-4 mr-1.5" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={editing ? "edit" : "reviews"} value={editing ? "edit" : undefined}>
          <TabsList className="mb-6">
            <TabsTrigger value="reviews" onClick={() => setEditing(false)}>
              <MessageSquare className="h-4 w-4 mr-1.5" />
              My Reviews
            </TabsTrigger>
            <TabsTrigger value="edit" onClick={() => setEditing(true)}>
              <Settings className="h-4 w-4 mr-1.5" />
              Edit Profile
            </TabsTrigger>
          </TabsList>

          {/* Edit Tab */}
          <TabsContent value="edit" forceMount={editing ? true : undefined} className={editing ? "" : "hidden"}>
            <div className="rounded-2xl border bg-card p-6 space-y-5 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1.5">
                  <User className="h-4 w-4" /> Name
                </Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-1.5" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setFormName(profile.name);
                    setFormEmail(profile.email);
                  }}
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Cancel
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className={editing ? "hidden" : ""}>
            {reviews.length === 0 ? (
              <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>You haven't written any reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="rounded-xl border bg-card p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < r.rating
                                ? "fill-star text-star"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
