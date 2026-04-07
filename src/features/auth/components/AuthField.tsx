// src/features/auth/components/AuthField.tsx

interface AuthFieldProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  error: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const AuthField = ({
  label,
  name,
  type,
  placeholder,
  value,
  error,
  onChange,
  required
}: AuthFieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-heading text-sm font-semibold">
        {label}
        {required && (
          <span className="text-primary ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        required={required}
        className={`bg-secondary text-body placeholder:text-muted h-12 w-full rounded-md border px-4 text-base transition-colors duration-150 outline-none ${
          error
            ? "border-error focus:border-error focus:ring-error bg-white focus:ring-1"
            : "border-border-default focus:border-primary focus:ring-primary focus:bg-white focus:ring-1"
        }`}
      />

      {error && (
        <p
          id={`${name}-error`}
          className="text-error pl-1 text-xs leading-4"
          role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthField;
