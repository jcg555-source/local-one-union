"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import type { Route } from "next";
import clsx from "clsx";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { useAuth } from "@/components/auth-provider";
import { BrandLockup } from "@/components/brand-lockup";
import { navLinks } from "@/lib/data";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { session, signOut } = useAuth();
  const isLoggedIn = session.role !== "guest";
  const isApproved = session.status === "approved";
  const isApprovedAdmin = session.role === "admin" && session.status === "approved";
  const isApprovedMember =
    session.role === "member" && session.status === "approved";
  const dashboardLinks: Array<{ href: Route; label: string }> = [];

  if (isApprovedAdmin) {
    dashboardLinks.push({ href: "/admin", label: "Admin Dashboard" });
  }

  if (isApprovedMember) {
    dashboardLinks.push({ href: "/portal", label: "Member Portal" });
  }

  const socialLinks = [
    {
      href: "https://www.instagram.com/localonesou/",
      label: "Instagram",
      icon: FaInstagram
    },
    {
      href: "https://www.facebook.com/localonesou?_rdc=2&_rdr",
      label: "Facebook",
      icon: FaFacebookF
    }
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-union-slate/80 bg-white/92 backdrop-blur">
        <div className="border-b border-union-slate/70 bg-union-navy text-white">
          <div className="container-shell flex items-center justify-between gap-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/72">
            <p>Representing Security Officers Nationwide</p>
            <p className="hidden text-union-gold sm:block">
              Community. Standards. Solidarity.
            </p>
          </div>
        </div>
        <div className="container-shell flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <BrandLockup compact />
          </Link>

          <button
            type="button"
            className="rounded-xl border border-union-slate px-3 py-2 text-sm font-medium text-union-navy lg:hidden"
            onClick={() => setOpen((value) => !value)}
          >
            Menu
          </button>

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "text-sm font-semibold uppercase tracking-[0.08em] transition hover:text-union-gold",
                  pathname === item.href ? "text-union-gold" : "text-union-steel"
                )}
              >
                {item.label}
              </Link>
            ))}
            {dashboardLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "text-sm font-semibold uppercase tracking-[0.08em] transition hover:text-union-gold",
                  pathname === item.href ? "text-union-gold" : "text-union-steel"
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    void signOut();
                  }}
                  className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-full border border-union-slate px-4 py-2 text-sm font-semibold text-union-navy transition hover:border-union-gold hover:text-union-gold"
                  >
                    Login
                  </Link>
                  <Link
                    href="/sign-up"
                    className="rounded-full bg-union-gold px-4 py-2 text-sm font-semibold text-union-navy transition hover:scale-[1.02]"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>

        {open ? (
          <div className="border-t border-union-slate/80 bg-white lg:hidden">
            <div className="container-shell flex flex-col gap-3 py-4">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl px-3 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-union-steel transition hover:bg-union-mist hover:text-union-navy"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {dashboardLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl px-3 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-union-steel transition hover:bg-union-mist hover:text-union-navy"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void signOut();
                  }}
                  className="rounded-full border border-union-slate px-4 py-2 text-center text-sm font-semibold text-union-navy"
                >
                  Sign Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href="/login"
                    className="rounded-full border border-union-slate px-4 py-2 text-center text-sm font-semibold text-union-navy"
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/sign-up"
                    className="rounded-full bg-union-gold px-4 py-2 text-center text-sm font-semibold text-union-navy"
                    onClick={() => setOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main>{children}</main>

      <footer className="border-t border-union-slate/80 bg-union-navy text-white">
        <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.2fr,1fr,1fr]">
          <div>
            <BrandLockup inverted />
            <p className="mt-4 max-w-md text-sm leading-7 text-white/78">
              Building stronger security careers through transparent contracts,
              responsive leadership, and organized member support across every
              represented worksite.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-union-gold">
              Public Pages
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/78">
              {navLinks.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-union-gold">
              Access
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/78">
              {(isApprovedMember || isApprovedAdmin) ? (
                <Link href="/portal" className="hover:text-white">
                  Member Portal
                </Link>
              ) : null}
              {isApprovedAdmin ? (
                <Link href="/admin" className="hover:text-white">
                  Admin Dashboard
                </Link>
              ) : null}
              {!isApprovedMember && !isApprovedAdmin ? (
                <Link href="/login" className="hover:text-white">
                  Member Login
                </Link>
              ) : null}
              <Link href="/contact" className="hover:text-white">
                Contact Local One
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container-shell flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
              Local One Security Officers Union
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/82 transition duration-200 hover:-translate-y-0.5 hover:border-union-gold/60 hover:bg-union-gold hover:text-union-navy"
                  >
                    <Icon className="h-4.5 w-4.5 transition group-hover:scale-105" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
