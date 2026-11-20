// node_modules/.nitro/vite/services/ssr/assets/age-B_oCmxWg.js
function ageFromBirthDate(iso) {
	if (!iso) return null;
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!m) return null;
	const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
	const birth = new Date(y, mo - 1, d);
	if (Number.isNaN(birth.getTime())) return null;
	const now = /* @__PURE__ */ new Date();
	let age = now.getFullYear() - birth.getFullYear();
	const mDiff = now.getMonth() - birth.getMonth();
	if (mDiff < 0 || mDiff === 0 && now.getDate() < birth.getDate()) age--;
	if (age < 0 || age > 130) return null;
	return age;
}
export { ageFromBirthDate as t };
