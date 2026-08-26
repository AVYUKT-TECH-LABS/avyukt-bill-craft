import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StateSelect } from "@/components/StateSelect";
import { TablesInsert } from "@/integrations/supabase/types";

interface ClientFormProps {
  onSubmit: (input: TablesInsert<"clients">) => Promise<void>;
  submitting?: boolean;
}

export const ClientForm = ({ onSubmit, submitting }: ClientFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, email: email || null, gstin: gstin || null, address: address || null, state: state || null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client-name">Client Name</Label>
          <Input id="client-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-email">Email</Label>
          <Input id="client-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-gstin">GSTIN (Optional)</Label>
          <Input id="client-gstin" value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="22AAAAA0000A1Z5" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-address">Address</Label>
          <Input id="client-address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-state">State</Label>
          <StateSelect id="client-state" value={state} onChange={setState} />
        </div>
      </div>
      <Button type="submit" disabled={submitting || !name}>
        {submitting ? "Creating..." : "Create Client"}
      </Button>
    </form>
  );
};
