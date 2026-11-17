import { createElement, lazy, type Attributes, type FunctionComponent, type PropsWithRef } from 'react'

/** Prepare the initial view before mounting; later optional views can still suspend. */
export function preparedComponent<Props extends object>(load: () => Promise<{ default: FunctionComponent<Props> }>) {
  let Ready: FunctionComponent<Props> | undefined
  let pending: Promise<void> | undefined
  const Deferred = lazy(load)

  return {
    preload() {
      pending ??= load().then(module => { Ready = module.default })
      return pending
    },
    Component(props: Props) {
      if (Ready) return createElement(Ready, props)
      return createElement(Deferred, props as Attributes & PropsWithRef<Props>)
    },
  }
}
