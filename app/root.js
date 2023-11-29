import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";
import styles from "./styles/index.css";

export const meta = () => [ { title: "New Remix App" } ];

export const links = () => [ { rel: "stylesheet", href: styles } ];

export default function App() {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<div className="titlebar"></div>
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}
