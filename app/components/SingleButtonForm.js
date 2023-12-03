import { Form } from "@remix-run/react";

/**
 * @function SingleButtonForm
 * @param {*} element attributes 
 * @returns Single button form element
 * @description This is a Remix component that creates a form with a single button.
 *   Rather than using a click eventy handler, Remix uses  forms to handle user
 *   actions. This component is used to create a form with a single button. Values 
 *   for the button and the action are passed in as props. Hidden fields can be
 *   used to pass additional data to the server action.
 */
const SingleButtonForm = ( { addClasses = "", action, submitValue, buttonText, fields = [] } ) => (
  <Form style={ { display: "inline" } } method="post" action={ action }>
    { fields.map( ( field, i ) => (
      <input key={ i } type="hidden" name={ field.name } value={ field.value } />
    ) ) }
    <button className={ `btn ${ addClasses }` } type="submit" name="_action" value={ submitValue }>{ buttonText }</button>
  </Form >
);

export default SingleButtonForm;