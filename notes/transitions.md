# Animated page transitions with Remix's nested routes

Source: [This blogpost](https://www.jacobparis.com/content/remix-animated-page-transitions).

Nested routes are one of React Router's best features. They allow you to create parent routes that act as layouts for their children. When a user navigates between child routes, the parent route doesn't unmount, which means we can animate the outlet for the nested routes.

Remix prominently uses React Router, so this works very well in Remix.

## Managing the navigation state

Adding animations to the navigation slows it down. A page load that could be instant will instead need to wait until the animation completes. Remix wants to unmount the current page immediately, so it can replace it with the new page, and that's the main source of problems we need to solve to make this work.

Instead of the `<Outlet />` component, we need the `useOutlet` hook so it returns a stable reference to the outlet element instead of creating a new component.
We need to freeze the outlet's routing context so it doesn't re-render during navigation.
The easiest way to solve this is to wrap the `useOutlet` hook with useState.This solution was proposed by Ryan Florence in a GitHub discussion on route transitions

```jsx
function AnimatedOutlet() {
  const [outlet] = useState(useOutlet());
  return outlet;
}
```

This stops the outlet from re-rendering when the route changes, but Remix will still unload the data for the previous route, which can sometimes cause this error to throw.

```bash
TypeError: Cannot destructure property 'data' of 'useLoaderData(...)' as it is undefined
```

To prevent this, allow the `useLoaderData` hook to fall back to an empty object so the destructuring doesn't fail. The page will not re-render after this, so it's ok if the data isn't there anymore.

```jsx
const { data } = useLoaderData() || {};
```

## Animating the navigation

There are examples in the Remix docs for animated routes with Framer Motion and Remix but it's not necessary to install all of Framer just for this.

A popular and much lighter library for animating React components is `react-transition-group`, which simply allows you to suspend mounting/unmounting of a component until an animation is complete, and adds CSS classes to the component during the animation.

```jsx
export default function Layout() {
  const location = useLocation();
  const nodeRef = useRef(null);
  return (
    <div className="mx-auto grid min-h-screen place-items-center">
      <SwitchTransition>
        <CSSTransition
          key={location.pathname}
          timeout={500}
          nodeRef={nodeRef}
          classNames={{
            enter: 'opacity-0',
            enterActive: 'opacity-100',
            exitActive: 'opacity-0'
          }}
        >
          <div ref={nodeRef} className="transition-all duration-500">
            <AnimatedOutlet />
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}
```

### References

GitHub discussion on [route transitions](https://github.com/remix-run/react-router/discussions/8008#discussioncomment-1280897)
