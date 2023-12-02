import { Form } from "@remix-run/react";

/**
 * @function SingleButtonForm
 * @param {*} element attributes 
 * @returns Single button form element
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