'use client';

// Drawers for a single clinic (overview / staff / patients) and a single pet owner (with pets).

import { useCallback, useEffect, useState } from 'react';
import { Loader2, PawPrint } from 'lucide-react';
import { toast } from 'sonner';
import {
  getClinic,
  getOwner,
  getErrorMessage,
  listClinicPatients,
  listClinicStaff,
  type AdminClinic,
  type AdminClinicPatient,
  type AdminOwner,
  type AdminPet,
  type AdminStaff
} from '@/lib/admin-users';
import {
  Drawer,
  Field,
  Pager,
  PresenceBadge,
  StatusBadge,
  asText,
  formatAddress,
  formatDate,
  lastSeen
} from './user-ui';

const Spinner = () => (
  <div className="flex justify-center py-10">
    <Loader2 className="animate-spin text-black/40" />
  </div>
);

const Empty = ({ text }: { text: string }) => (
  <p className="py-10 text-center text-sm text-black/50">{text}</p>
);

const petLine = (p?: AdminPet) =>
  [p?.species, p?.breed, p?.sex, p?.age !== undefined ? `${p.age} yrs` : null].filter(Boolean).join(' · ');

// ---------- Clinic staff ----------

function StaffList({ clinicId }: { clinicId: string }) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<AdminStaff[]>([]);
  const [meta, setMeta] = useState({ pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    listClinicStaff(clinicId, { page, limit: 10 })
      .then((res) => {
        if (cancelled) return;
        setRows(res.staff);
        setMeta({ pages: res.pages, total: res.total });
      })
      .catch((e) => !cancelled && toast.error(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [clinicId, page]);

  if (loading) return <Spinner />;
  if (!rows.length) return <Empty text="No staff accounts under this clinic." />;

  return (
    <>
      <ul className="divide-y divide-black/10">
        {rows.map((s) => (
          <li key={s._id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-acc-clr pry-ff">{s.fullname || s.email}</p>
              <p className="truncate text-xs text-black/50 sec-ff">{s.email}</p>
            </div>
            <div className="flex flex-col items-end gap-1 pry-ff">
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs capitalize">
                {s.role}
                {s.status === 'revoked' ? ' · revoked' : ''}
              </span>
              <PresenceBadge presence={s.presence} />
            </div>
          </li>
        ))}
      </ul>
      <Pager page={page} pages={meta.pages} total={meta.total} onChange={setPage} />
    </>
  );
}

// ---------- Clinic patients ----------

function PatientList({ clinicId }: { clinicId: string }) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<AdminClinicPatient[]>([]);
  const [meta, setMeta] = useState({ pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    listClinicPatients(clinicId, { page, limit: 10 })
      .then((res) => {
        if (cancelled) return;
        setRows(res.patients);
        setMeta({ pages: res.pages, total: res.total });
      })
      .catch((e) => !cancelled && toast.error(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [clinicId, page]);

  if (loading) return <Spinner />;
  if (!rows.length) return <Empty text="No patients registered at this clinic." />;

  return (
    <>
      <ul className="divide-y divide-black/10">
        {rows.map((p) => (
          <li key={p._id} className="py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-medium text-black-clr pry-ff">{p.pet?.name || 'Unnamed pet'}</p>
              {p.registrationNo && (
                <span className="rounded-md bg-black/5 px-2 py-0.5 text-xs sec-ff">{p.registrationNo}</span>
              )}
            </div>
            <p className="text-xs text-black/50 sec-ff">{petLine(p.pet) || '—'}</p>
            <p className="mt-1 text-xs text-black/60 pry-ff">
              Owner: {p.owner?.fullname || '—'}
              {p.owner?.phoneNumber ? ` · ${p.owner.phoneNumber}` : ''}
            </p>
          </li>
        ))}
      </ul>
      <Pager page={page} pages={meta.pages} total={meta.total} onChange={setPage} />
    </>
  );
}

// ---------- Clinic drawer ----------

type Tab = 'overview' | 'staff' | 'patients';

export function ClinicDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const [clinic, setClinic] = useState<AdminClinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('overview');

  const load = useCallback(async () => {
    try {
      const res = await getClinic(id);
      setClinic(res.clinic);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    load();
  }, [load]);

  const tabs: Tab[] = ['overview', 'staff', 'patients'];

  return (
    <Drawer title={clinic?.clinicName || clinic?.fullname || 'Clinic'} onClose={onClose}>
      {loading ? (
        <Spinner />
      ) : error || !clinic ? (
        <Empty text={error || 'Clinic not found.'} />
      ) : (
        <>
          <div className="mb-4 flex gap-1 rounded-lg bg-black/5 p-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm capitalize sec-ff ${
                  tab === t ? 'bg-white font-medium shadow-sm' : 'text-black/60'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <StatusBadge status={clinic.status} />
                <PresenceBadge presence={clinic.presence} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Email" value={clinic.email} />
                <Field label="Phone" value={clinic.phoneNumber} />
                <Field label="Address" value={formatAddress(clinic.address)} />
                <Field
                  label="Hours"
                  value={
                    clinic.startingTime && clinic.closingTime
                      ? `${clinic.startingTime} – ${clinic.closingTime}`
                      : undefined
                  }
                />
                <Field label="Days open" value={asText(clinic.daysOpen)} />
                <Field label="Animals handled" value={asText(clinic.animalsHandled)} />
                <div className="col-span-2">
                  <Field label="Services" value={asText(clinic.servicesProvided?.map((x) => x.name))} />
                </div>
                <Field
                  label="Plan"
                  value={
                    clinic.subscription?.plan
                      ? `${clinic.subscription.plan} · ${clinic.subscription.status ?? ''}`
                      : undefined
                  }
                />
                <Field label="Plan expires" value={formatDate(clinic.subscription?.expiresAt)} />
                <Field label="Registered" value={formatDate(clinic.createdAt)} />
                <Field label="Last seen" value={lastSeen(clinic.lastActiveAt, clinic.lastLoginAt)} />
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-sec-clr sec-ff uppercase">Documents</h3>
                <p className="mb-2 text-sm text-black/70 sec-ff">
                  License no: {clinic.clinicProfile?.licenseNumber || '—'}
                </p>
                <div className="flex flex-wrap gap-3 text-sm pry-ff">
                  {[
                    { label: 'License', url: clinic.clinicProfile?.licenseDocument },
                    { label: 'Passport', url: clinic.clinicProfile?.ownerPassport },
                    ...[clinic.clinicProfile?.ownerIDCard ?? []].flat().map((url, i) => ({
                      label: `ID card ${i + 1}`,
                      url
                    }))
                  ]
                    .filter((d) => d.url)
                    .map((d) => (
                      <a
                        key={d.label}
                        href={d.url as string}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-black/10 px-3 py-1.5 text-acc-clr hover:bg-black/5"
                      >
                        {d.label}
                      </a>
                    ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'staff' && <StaffList clinicId={id} />}
          {tab === 'patients' && <PatientList clinicId={id} />}
        </>
      )}
    </Drawer>
  );
}

// ---------- Owner drawer ----------

export function OwnerDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const [owner, setOwner] = useState<AdminOwner | null>(null);
  const [pets, setPets] = useState<AdminPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getOwner(id)
      .then((res) => {
        if (cancelled) return;
        setOwner(res.owner);
        setPets(res.pets);
      })
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <Drawer title={owner?.fullname || 'Pet owner'} onClose={onClose}>
      {loading ? (
        <Spinner />
      ) : error || !owner ? (
        <Empty text={error || 'Owner not found.'} />
      ) : (
        <div className="space-y-6">
          <PresenceBadge presence={owner.presence} />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" value={owner.email} />
            <Field label="Phone" value={owner.phoneNumber} />
            <Field label="Joined" value={formatDate(owner.createdAt)} />
            <Field label="Last seen" value={lastSeen(owner.lastActiveAt, owner.lastLoginAt)} />
          </div>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-sec-clr sec-ff uppercase">Pets ({pets.length})</h3>
            {pets.length === 0 ? (
              <Empty text="This owner has no pets on file." />
            ) : (
              <ul className="divide-y divide-black/10 rounded-lg border border-black/10">
                {pets.map((p) => (
                  <li key={p._id} className="flex items-center gap-3 p-3">
                    <PawPrint size={18} className="shrink-0 text-black/40" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-black-clr pry-ff">{p.name || 'Unnamed pet'}</p>
                      <p className="text-xs text-black/50 sec-ff">{petLine(p) || '—'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Drawer>
  );
}