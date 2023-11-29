import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLocation,
	useOutlet
} from "@remix-run/react";

import { useState, useRef } from "react";
import { SwitchTransition, CSSTransition } from "react-transition-group";

import styles from "./styles/index.css";



export const meta = () => [ { title: "New Remix App" } ];

export const links = () => [ { rel: "stylesheet", href: styles } ];

export default function App() {
	// Adding screen transitions.
	// See: https://www.jacobparis.com/content/remix-animated-page-transitions
	function AnimatedOutlet() {
		const [ outlet ] = useState( useOutlet() );
		return outlet;
	}

	const location = useLocation();
	const nodeRef = useRef( null );

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

				<SwitchTransition>
					<CSSTransition
						key={ location.pathname }
						timeout={ 500 }
						nodeRef={ nodeRef }
						classNames="fade"
					>
						<div
							ref={ nodeRef }
							className="transition-all duration-500"
						>
							<AnimatedOutlet />
						</div>
					</CSSTransition>
				</SwitchTransition>


				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}
