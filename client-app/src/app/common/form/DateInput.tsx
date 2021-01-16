import React from "react";
import { FieldRenderProps } from "react-final-form";
import { DateTimePicker } from "react-widgets";
import { Form, FormFieldProps, Label } from "semantic-ui-react";

interface IProps extends FieldRenderProps<Date, any>, FormFieldProps {}

const DateInput: React.FC<IProps> = ({
  id,
  input,
  width,
  date = false,
  time = false,
  placeholder,
  meta: { touched, error },
  ...rest
}) => {
  return (
    <Form.Field error={touched && !!error} width={width}>
      <DateTimePicker
        id={undefined}
        placeholder={placeholder}
        value={input.value || null}
        date={date}
        time={time}
        onKeyDown={(e) => e.preventDefault()}
        onChange={input.onChange}
        onBlur={input.onBlur}
        {...rest}
      />
      {touched && error && (
        <Label basic color="red">
          {error}
        </Label>
      )}
    </Form.Field>
  );
};

export default DateInput;
