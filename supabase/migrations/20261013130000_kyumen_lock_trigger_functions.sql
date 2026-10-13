-- Kyumen: fungsi trigger tidak boleh dipanggil lewat REST (/rpc)
revoke all on function public.hc_agent_feedback_fill() from public, anon, authenticated;
revoke all on function public.hc_agent_skills_changed() from public, anon, authenticated;
revoke all on function public.hc_agent_skills_recompile() from public, anon, authenticated;
revoke all on function public.hc_agent_routines_schedule() from public, anon, authenticated;
revoke all on function public.hc_profiles_guard() from public, anon, authenticated;
revoke all on function public.hc_approvals_notify_n8n() from public, anon, authenticated;
