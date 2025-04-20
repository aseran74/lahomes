'use client'
import Choices from 'choices.js'
import { type HTMLAttributes, type ReactElement, useEffect, useRef } from 'react'
import { type Control, useController } from 'react-hook-form'

export type ChoiceProps = HTMLAttributes<HTMLSelectElement> & {
  multiple?: boolean
  className?: string
  name: string
  control: Control<any>
  children: ReactElement[]
}

const ChoicesFormInput = ({ 
  children, 
  multiple, 
  className,
  name,
  control,
  ...props 
}: ChoiceProps) => {
  const selectRef = useRef<HTMLSelectElement | null>(null)
  const choicesInstanceRef = useRef<Choices | null>(null)

  const { field } = useController({
    name,
    control
  })

  useEffect(() => {
    const element = selectRef.current
    if (element && !choicesInstanceRef.current) {
      choicesInstanceRef.current = new Choices(element, {
        placeholder: true,
        allowHTML: true,
        shouldSort: false,
        removeItemButton: true
      })
    }

    return () => {
      if (choicesInstanceRef.current) {
        choicesInstanceRef.current.destroy()
        choicesInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const element = selectRef.current
    if (!element) return

    const handleChange = (e: Event) => {
      if (!(e.target instanceof HTMLSelectElement)) return
      
      const value = multiple 
        ? Array.from(e.target.selectedOptions).map(option => option.value)
        : e.target.value

      field.onChange(value)
    }

    element.addEventListener('change', handleChange)
    return () => element.removeEventListener('change', handleChange)
  }, [field, multiple])

  return (
    <select 
      ref={(el) => {
        selectRef.current = el
        if (el) field.ref(el)
      }}
      multiple={multiple}
      className={className}
      {...props}
      value={field.value || (multiple ? [] : '')}
      onChange={field.onChange}
      onBlur={field.onBlur}
    >
      {children}
    </select>
  )
}

export default ChoicesFormInput
