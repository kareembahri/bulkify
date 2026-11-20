'use client';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Copy, Crown, Dumbbell, Link2, Medal, Share2, Trophy, UserMinus, UserPlus, Users, UtensilsCrossed, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Panel, SectionTitle } from '@/components/ui/Panel';
import { Reveal } from '@/components/ui/Reveal';
import { Sheet } from '@/components/ui/Sheet';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/Confirm';
import { useProfile } from '@/lib/auth';
import { useFmt } from '@/lib/format';
import {
  cleanCode, loadFriend, loadFriends, removeFriend, requestFriend, respondFriend, SCORE,
  type BoardRow, type FriendDetail, type FriendRequest,
} from '@/lib/friends';
import { tick } from '@/lib/haptics';
import { inviteUrl, takePendingInvite } from '@/lib/invite';
import { invalidate, useQuery } from '@/lib/query';
import { ratioOf, score, scoreColor } from '@/lib/targets';

const nameOf = (n: string, code: string, fallback: string) => n.trim() || `${fallback} #${code}`;

export default function FriendsPage() {
  const t = useTranslations();
  const toast = useToast();
  const { profile } = useProfile();
  const q = useQuery('friends', loadFriends, 30_000);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<BoardRow | null>(null);

  const addBox = useRef<HTMLDivElement>(null);
  const [link, setLink] = useState('');
  useEffect(() => setLink(inviteUrl(profile.friend_code)), [profile.friend_code]);
  const [highlight, setHighlight] = useState(false);
  const handled = useRef(false);

  async function sendRequest(c: string) {
    setBusy(true);
    try {
      const r = await requestFriend(c);
      const ok = r === 'sent' || r === 'accepted';
      toast.show(t(`friends.result.${r}`), ok || r === 'pending' || r === 'already' ? undefined : { tone: 'error' });
      if (ok) tick(15);
      setCode('');
      invalidate('friends');
    } catch { toast.show(t('common.saveFailed'), { tone: 'error' }); } finally { setBusy(false); }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { toast.show(t('friends.need6'), { tone: 'error' }); return; }
    await sendRequest(code);
  }

  // Opened from an invite link (/invite/123456 or /friends?add=123456): show the code
  // in the add box and send the request automatically, once.
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    const fromUrl = new URLSearchParams(window.location.search).get('add');
    const stored = takePendingInvite();
    const c = cleanCode(fromUrl ?? stored ?? '');
    if (fromUrl) window.history.replaceState(null, '', '/friends');
    if (c.length !== 6) return;
    setCode(c);
    setHighlight(true);
    addBox.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    void sendRequest(c).finally(() => setTimeout(() => setHighlight(false), 2500));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function copyText(text: string, msg: string) {
    try { await navigator.clipboard.writeText(text); tick(10); toast.show(msg); }
    catch { toast.show(text); }
  }
  const copy = () => copyText(profile.friend_code, t('friends.copied'));
  async function shareLink() {
    const url = inviteUrl(profile.friend_code);
    const text = t('friends.inviteText', { code: profile.friend_code });
    if (navigator.share) {
      try { await navigator.share({ title: 'Bulkify', text, url }); return; } catch { /* cancelled */ return; }
    }
    await copyText(url, t('friends.linkCopied'));
  }

  const d = q.data;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{t('friends.title')}</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* your ID + add a friend */}
        <Reveal>
          <Panel edge className={`h-full space-y-4 transition-shadow duration-500 ${highlight ? 'shadow-glow ring-2 ring-accent/60' : ''}`} ref={addBox}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="label">{t('friends.yourId')}</p>
                <p dir="ltr" className="num font-display text-4xl font-semibold tracking-[0.18em] text-accent">{profile.friend_code}</p>
              </div>
              <Button size="icon" onClick={copy} aria-label={t('friends.copy')}><Copy className="size-4" /></Button>
            </div>
            <p className="text-xs text-muted">{t('friends.yourIdHint')}</p>

            {/* invite link */}
            <div className="rounded-2xl bg-[rgb(var(--line)/0.04)] p-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"><Link2 className="size-4 text-accent" />{t('friends.inviteTitle')}</p>
              <p dir="ltr" className="num mb-2.5 truncate rounded-xl bg-[rgb(var(--line)/0.05)] px-3 py-2 text-xs text-muted">
                {link.replace(/^https?:\/\//, '') || `/invite/${profile.friend_code}`}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="primary" size="sm" onClick={shareLink}><Share2 className="size-4" />{t('friends.share')}</Button>
                <Button size="sm" onClick={() => copyText(link || inviteUrl(profile.friend_code), t('friends.linkCopied'))}><Copy className="size-4" />{t('friends.copyLink')}</Button>
              </div>
              <p className="mt-2 text-[11px] text-muted">{t('friends.inviteHint')}</p>
            </div>
            <form onSubmit={add} className="flex gap-2">
              <input dir="ltr" inputMode="numeric" autoComplete="off" placeholder="123456" aria-label={t('friends.addLabel')}
                className="field num flex-1 text-center text-lg tracking-[0.3em]" value={code} onChange={(e) => setCode(cleanCode(e.target.value))} />
              <Button type="submit" variant="primary" loading={busy} disabled={code.length !== 6}>
                <UserPlus className="size-4" />{t('friends.add')}
              </Button>
            </form>
            <p className="text-xs text-muted">{t('friends.privacy')}</p>
          </Panel>
        </Reveal>

        {/* requests */}
        <Reveal delay={0.05}>
          <Panel className="h-full">
            <SectionTitle>{t('friends.requests')}</SectionTitle>
            {!d ? <Skeleton className="h-16" /> : d.incoming.length + d.outgoing.length === 0 ? (
              <p className="text-sm text-muted">{t('friends.noRequests')}</p>
            ) : (
              <ul className="space-y-2">
                {d.incoming.map((r) => <RequestRow key={r.id} r={r} incoming />)}
                {d.outgoing.map((r) => <RequestRow key={r.id} r={r} />)}
              </ul>
            )}
          </Panel>
        </Reveal>

        {/* leaderboard */}
        <Reveal className="lg:col-span-2">
          <Panel>
            <SectionTitle action={<span className="text-[11px] text-muted">{t('friends.last7')}</span>}>
              <span className="inline-flex items-center gap-2"><Trophy className="size-3.5" />{t('friends.leaderboard')}</span>
            </SectionTitle>
            {q.error && !d ? <ErrorState onRetry={q.refresh} /> : !d ? (
              <div className="space-y-2"><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
            ) : d.board.length <= 1 ? (
              <>
                <ol className="space-y-2">
                  {d.board.map((r, i) => <BoardItem key={r.id} r={r} rank={i + 1} onOpen={() => setOpen(r)} />)}
                </ol>
                <EmptyState compact icon={Users} title={t('friends.empty')} hint={t('friends.emptyHint')} />
              </>
            ) : (
              <ol className="space-y-2">
                {d.board.map((r, i) => <BoardItem key={r.id} r={r} rank={i + 1} onOpen={() => setOpen(r)} />)}
              </ol>
            )}
            <p className="mt-3 text-xs text-muted">{t('friends.scoreHint', SCORE)}</p>
          </Panel>
        </Reveal>
      </div>

      <FriendSheet row={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function RequestRow({ r, incoming }: { r: FriendRequest; incoming?: boolean }) {
  const t = useTranslations();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const act = async (fn: () => Promise<void>, msg?: string) => {
    setBusy(true);
    try { await fn(); if (msg) toast.show(msg); invalidate('friends'); }
    catch { toast.show(t('common.saveFailed'), { tone: 'error' }); } finally { setBusy(false); }
  };
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-[rgb(var(--line)/0.04)] px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{nameOf(r.name, r.code, t('friends.friend'))}</p>
        <p className="text-xs text-muted">{incoming ? t('friends.wantsToAdd') : t('friends.waiting')} · <span dir="ltr" className="num">#{r.code}</span></p>
      </div>
      {incoming ? (
        <>
          <Button size="icon" variant="primary" disabled={busy} aria-label={t('friends.accept')}
            onClick={() => act(() => respondFriend(r.id, true), t('friends.result.accepted'))}><Check className="size-4" /></Button>
          <Button size="icon" disabled={busy} aria-label={t('friends.decline')} onClick={() => act(() => respondFriend(r.id, false))}><X className="size-4" /></Button>
        </>
      ) : (
        <Button size="sm" disabled={busy} onClick={() => act(() => removeFriend(r.user_id))}>{t('friends.cancelRequest')}</Button>
      )}
    </li>
  );
}

function BoardItem({ r, rank, onOpen }: { r: BoardRow; rank: number; onOpen: () => void }) {
  const t = useTranslations();
  const f = useFmt();
  const medal = rank === 1 ? 'text-[#f5c542]' : rank === 2 ? 'text-[#c0c7d0]' : rank === 3 ? 'text-[#d08a4f]' : '';
  return (
    <motion.li initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(rank, 8) * 0.04 }} className="list-none">
      <button type="button" onClick={() => { tick(5); onOpen(); }}
        className={`press flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-start transition-colors
          ${r.me ? 'bg-accent/15 ring-1 ring-accent/40' : 'bg-[rgb(var(--line)/0.04)] hover:bg-[rgb(var(--line)/0.07)]'}`}>
        <span className="grid size-9 shrink-0 place-items-center">
          {rank === 1 ? <Crown className={`size-6 ${medal}`} /> : rank <= 3 ? <Medal className={`size-6 ${medal}`} /> : <span className="num text-sm font-semibold text-muted">{rank}</span>}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{nameOf(r.name, r.code, t('friends.friend'))}{r.me && <span className="ms-1.5 text-xs font-medium text-accent">({t('friends.you')})</span>}</span>
          <span className="flex flex-wrap gap-x-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1"><Dumbbell className="size-3" />{t('friends.trainingDays', { n: r.stats.training_days })}</span>
            <span className="inline-flex items-center gap-1"><UtensilsCrossed className="size-3" />{t('friends.foodDays', { n: r.stats.food_days })}</span>
            <span>{t('friends.sets', { n: r.stats.sets })}</span>
          </span>
        </span>
        <span className="text-end">
          <span className="num block font-display text-xl font-semibold">{f.n0(r.stats.score)}</span>
          <span className="block text-[10px] text-muted">{t('friends.points')}</span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted rtl:rotate-180" />
      </button>
    </motion.li>
  );
}

function FriendSheet({ row, onClose }: { row: BoardRow | null; onClose: () => void }) {
  const t = useTranslations();
  const f = useFmt();
  const toast = useToast();
  const confirm = useConfirm();
  const q = useQuery<FriendDetail>(row ? `friend:${row.id}` : null, () => loadFriend(row!.id), 30_000);
  const d = q.data;
  const g = f.ar ? ' غ' : ' g';

  async function remove() {
    if (!row) return;
    const ok = await confirm({ title: t('friends.removeTitle'), body: t('friends.removeBody'), confirmLabel: t('friends.remove'), danger: true });
    if (!ok) return;
    try { await removeFriend(row.id); invalidate('friends'); onClose(); toast.show(t('friends.removed')); }
    catch { toast.show(t('common.saveFailed'), { tone: 'error' }); }
  }

  const macros = d ? ([
    { key: 'kcal', eaten: +d.eaten.kcal, goal: d.targets.kcal, unit: ` ${t('common.kcal')}` },
    { key: 'protein', eaten: +d.eaten.protein, goal: d.targets.protein, unit: g },
    { key: 'carbs', eaten: +d.eaten.carbs, goal: d.targets.carbs, unit: g },
    { key: 'fat', eaten: +d.eaten.fat, goal: d.targets.fat, unit: g },
  ] as const) : [];
  const w = d?.workout;
  const totalSets = w?.exercises.reduce((s, e) => s + e.sets, 0) ?? 0;
  const totalReps = w?.exercises.reduce((s, e) => s + e.reps, 0) ?? 0;

  return (
    <Sheet open={!!row} onClose={onClose} tall title={row ? nameOf(row.name, row.code, t('friends.friend')) : ''}>
      {!d ? (q.error ? <ErrorState onRetry={q.refresh} /> : <div className="space-y-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-20" /></div>) : (
        <div className="space-y-5 pb-6">
          <p className="text-xs text-muted"><span dir="ltr" className="num">#{d.code}</span>{d.goal ? ` · ${t(`calc.goals.${d.goal}`)}` : ''}</p>

          {/* today's food as % of targets */}
          <section>
            <h3 className="label mb-2">{t('friends.todayFood')}</h3>
            <div className="grid grid-cols-2 gap-2">
              {macros.map((m) => {
                const ratio = ratioOf(m.eaten, m.goal);
                const color = scoreColor(score(ratio, d.goal ?? 'maintain'));
                return (
                  <div key={m.key} className="rounded-2xl bg-[rgb(var(--line)/0.04)] p-3">
                    <p className="text-xs text-muted">{t(`macros.${m.key}`)}</p>
                    <p className="num font-display text-2xl font-semibold" style={{ color: m.goal ? color : undefined }}>
                      {m.goal ? `${f.n0(ratio * 100)}%` : '—'}
                    </p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[rgb(var(--line)/0.08)]">
                      <motion.div className="h-full rounded-full" style={{ background: color }}
                        initial={{ width: 0 }} animate={{ width: `${Math.min(ratio / 1.1, 1) * 100}%` }} transition={{ type: 'spring', stiffness: 70, damping: 18 }} />
                    </div>
                    <p className="num mt-1 text-[11px] text-muted">{f.n0(m.eaten)}{m.goal ? ` / ${f.n0(m.goal)}` : ''}{m.unit}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* latest training day */}
          <section>
            <h3 className="label mb-2">{t('friends.training')}</h3>
            {!w ? <p className="text-sm text-muted">{t('friends.noWorkout')}</p> : (
              <div className="rounded-2xl bg-[rgb(var(--line)/0.04)] p-3">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">{w.day_name || t('friends.workout')}</p>
                  <p className="text-xs text-muted">{f.dayLong(w.date)}</p>
                </div>
                <div className="mb-3 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label={t('friends.exercises')} value={w.exercises.length} />
                  <MiniStat label={t('friends.setsLabel')} value={totalSets} />
                  <MiniStat label={t('friends.reps')} value={totalReps} />
                </div>
                <ul className="divide-y divide-[rgb(var(--line)/0.07)]">
                  {w.exercises.map((e, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="min-w-0 flex-1 truncate">{f.ar ? e.name_ar || e.name_en : e.name_en}</span>
                      <span className="num shrink-0 text-xs text-muted">{t('friends.setsReps', { sets: e.sets, reps: e.reps })}{+e.top_kg > 0 ? ` · ${f.kg(+e.top_kg)}` : ''}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* top 3 PRs */}
          <section>
            <h3 className="label mb-2">{t('friends.topPrs')}</h3>
            {d.prs.length === 0 ? <p className="text-sm text-muted">{t('friends.noPrs')}</p> : (
              <ol className="space-y-2">
                {d.prs.map((p, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-2xl bg-[rgb(var(--line)/0.04)] px-3 py-2.5">
                    <Medal className={`size-5 shrink-0 ${i === 0 ? 'text-[#f5c542]' : i === 1 ? 'text-[#c0c7d0]' : 'text-[#d08a4f]'}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{f.ar ? p.name_ar || p.name_en : p.name_en}</span>
                      <span className="block text-xs text-muted">{f.dayMonthYear(p.date)}</span>
                    </span>
                    <span className="num text-end font-semibold">{f.kg(+p.weight_kg)} <span className="text-xs font-normal text-muted">× {p.reps}</span></span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* week score */}
          <section className="rounded-2xl bg-accent/10 p-3 ring-1 ring-accent/30">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{t('friends.weekScore')}</p>
              <p className="num font-display text-2xl font-semibold text-accent">{f.n0(d.stats.score)}</p>
            </div>
            <p className="mt-1 text-xs text-muted">
              {t('friends.trainingDays', { n: d.stats.training_days })} · {t('friends.foodDays', { n: d.stats.food_days })} · {t('friends.sets', { n: d.stats.sets })}
            </p>
          </section>

          {!d.me && (
            <button type="button" onClick={remove}
              className="press flex w-full items-center justify-center gap-2 rounded-2xl border border-bad/40 px-4 py-3 text-sm font-semibold text-bad hover:bg-bad/10">
              <UserMinus className="size-4" />{t('friends.remove')}
            </button>
          )}
        </div>
      )}
    </Sheet>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  const f = useFmt();
  return (
    <div className="rounded-xl bg-[rgb(var(--line)/0.05)] px-2 py-2">
      <p className="num font-display text-lg font-semibold">{f.n0(value)}</p>
      <p className="text-[10px] text-muted">{label}</p>
    </div>
  );
}
