import { redirect } from "@sveltejs/kit";
import { getOIDCAuthorizationUrl, get_current_username } from "$lib/server/auth";
import { base } from "$app/paths";
import { env } from "$env/dynamic/private";
import { updateUser } from "./callback/updateUser.js";

export const actions = {
	async default({ url, locals, request, cookies }) {
		const token = cookies.get("CF_Authorization");
		if (token) {
			const user = await get_current_username(token);
			if (user) {
				await updateUser({ userData: user, locals, cookies });
				redirect(303, `${base}/`);
			}
		}

		const referer = request.headers.get("referer");
		let redirectURI = `${(referer ? new URL(referer) : url).origin}${base}/login/callback`;

		// TODO: Handle errors if provider is not responding

		if (url.searchParams.has("callback")) {
			const callback = url.searchParams.get("callback") || redirectURI;
			if (env.ALTERNATIVE_REDIRECT_URLS.includes(callback)) {
				redirectURI = callback;
			}
		}

		const authorizationUrl = await getOIDCAuthorizationUrl(
			{ redirectURI },
			{ sessionId: locals.sessionId }
		);

		redirect(303, authorizationUrl);
	},
};
