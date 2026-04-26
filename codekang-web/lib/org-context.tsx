'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  ensureDefaultOrg,
  fetchOrganizations,
  fetchOrgRepos,
  type IOrganization,
  type IRepository,
} from '@/lib/auth';

type OrgContextType = {
  orgs: IOrganization[];
  selectedOrgId: string | null;
  setSelectedOrgId: (id: string) => void;
  selectedOrg: IOrganization | null;
  orgRepos: IRepository[];
  orgReposLoading: boolean;
  refreshOrgs: () => Promise<void>;
};

const OrgContext = createContext<OrgContextType>({
  orgs: [],
  selectedOrgId: null,
  setSelectedOrgId: () => {},
  selectedOrg: null,
  orgRepos: [],
  orgReposLoading: false,
  refreshOrgs: async () => {},
});

export function OrgProvider({ children }: { children: ReactNode }) {
  const [orgs, setOrgs] = useState<IOrganization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [orgRepos, setOrgRepos] = useState<IRepository[]>([]);
  const [orgReposLoading, setOrgReposLoading] = useState(false);

  const refreshOrgs = useCallback(async () => {
    try {
      const data = await fetchOrganizations();
      setOrgs(data);
      // Keep selection valid; if selected org no longer exists, fall back to first
      setSelectedOrgId((prev) => {
        if (prev && data.some((o) => o.id === prev)) return prev;
        return data[0]?.id ?? null;
      });
    } catch {
      // non-blocking
    }
  }, []);

  // On mount: ensure personal org exists, then load all orgs
  useEffect(() => {
    (async () => {
      try {
        await ensureDefaultOrg();
      } catch {
        // If this fails (e.g. not logged in yet), refreshOrgs will handle empty state
      }
      await refreshOrgs();
    })();
  }, [refreshOrgs]);

  // Auto-select first org when orgs load for the first time
  useEffect(() => {
    if (orgs.length > 0 && selectedOrgId === null) {
      setSelectedOrgId(orgs[0].id);
    }
  }, [orgs, selectedOrgId]);

  // Reload repos whenever selected org changes
  useEffect(() => {
    if (!selectedOrgId) {
      setOrgRepos([]);
      return;
    }
    setOrgReposLoading(true);
    fetchOrgRepos(selectedOrgId)
      .then(setOrgRepos)
      .catch(() => setOrgRepos([]))
      .finally(() => setOrgReposLoading(false));
  }, [selectedOrgId]);

  const selectedOrg = orgs.find((o) => o.id === selectedOrgId) ?? null;

  return (
    <OrgContext.Provider
      value={{
        orgs,
        selectedOrgId,
        setSelectedOrgId,
        selectedOrg,
        orgRepos,
        orgReposLoading,
        refreshOrgs,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  return useContext(OrgContext);
}
