import { useEffect, useState } from "react";
import { getCompanySettings, updateCompanySettings, CompanySettings } from "@/lib/api";
import { StateSelect } from "@/components/StateSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Settings = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCompanySettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof CompanySettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await updateCompanySettings(settings.id, {
        company_name: settings.company_name,
        company_address: settings.company_address,
        company_city: settings.company_city,
        company_state: settings.company_state,
        company_zip: settings.company_zip,
        company_phone: settings.company_phone,
        company_email: settings.company_email,
        company_gstin: settings.company_gstin || null,
        company_pan: settings.company_pan || null,
        company_cin: settings.company_cin || null,
      });
      setSettings(updated);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Company Settings</h1>
        <p className="text-sm text-muted-foreground">
          These details appear on every new invoice and receipt. Already-issued invoices keep their own snapshot and won't change.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={settings.company_name}
              onChange={(e) => handleChange("company_name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="company_address">Address</Label>
            <Input
              id="company_address"
              value={settings.company_address}
              onChange={(e) => handleChange("company_address", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_city">City</Label>
            <Input
              id="company_city"
              value={settings.company_city}
              onChange={(e) => handleChange("company_city", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_state">State</Label>
            <StateSelect
              id="company_state"
              value={settings.company_state}
              onChange={(v) => handleChange("company_state", v)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_zip">ZIP Code</Label>
            <Input
              id="company_zip"
              value={settings.company_zip}
              onChange={(e) => handleChange("company_zip", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_phone">Phone</Label>
            <Input
              id="company_phone"
              value={settings.company_phone}
              onChange={(e) => handleChange("company_phone", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_email">Email</Label>
            <Input
              id="company_email"
              type="email"
              value={settings.company_email}
              onChange={(e) => handleChange("company_email", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_gstin">GSTIN (Optional)</Label>
            <Input
              id="company_gstin"
              value={settings.company_gstin || ""}
              onChange={(e) => handleChange("company_gstin", e.target.value)}
              placeholder="22AAAAA0000A1Z5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_pan">PAN (Optional)</Label>
            <Input
              id="company_pan"
              value={settings.company_pan || ""}
              onChange={(e) => handleChange("company_pan", e.target.value)}
              placeholder="AAAAA0000A"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_cin">CIN (Optional)</Label>
            <Input
              id="company_cin"
              value={settings.company_cin || ""}
              onChange={(e) => handleChange("company_cin", e.target.value)}
              placeholder="U72200DL2016PTC290922"
            />
          </div>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </form>
    </div>
  );
};

export default Settings;
