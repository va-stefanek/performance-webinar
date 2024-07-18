import { DestroyRef, Signal, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { distinctUntilChanged, map } from 'rxjs';

export interface UrlQueryParameterConverter<T> {
  fromQuery(
    queryParameterValues: string[],
    defaultValue: T | undefined,
    currentValue: T | null
  ): T;

  toQuery(
    value: T,
    defaultValue: T | undefined,
    currentQueryParameterValues: string[]
  ): string[];
}

function arraysAreEqual(a: string[] | null, b: string[] | null): boolean {
  return !!(
    (!a && !b) ||
    (a && b && a.length === b.length && JSON.stringify(a) === JSON.stringify(b))
  );
}

export interface UrlQueryParameterOptions<T> {
  debounceTime?: number;
  defaultValue?: T;
  converter: UrlQueryParameterConverter<T>;
}

function capitalizeFirstLetter(inputString: string): string {
  return inputString.charAt(0).toUpperCase() + inputString.slice(1);
}

export const stringQueryParamConverter: UrlQueryParameterConverter<string> = {
  fromQuery: (queryParameterValues: string[], defaultValue) =>
    queryParameterValues?.[0] || defaultValue || '',
  toQuery: (value: string) => (value ? [value] : []),
};

export const numberQueryParamConverter: UrlQueryParameterConverter<number> = {
  fromQuery: (queryParameterValues: string[], defaultValue: number) =>
    queryParameterValues?.length > 0
      ? parseInt(queryParameterValues[0], 10)
      : defaultValue,
  toQuery: (value: number) => (value > 1 ? [value.toString()] : []),
};

export function withUrlParam<
  QueryKey extends string,
  T,
  ParamOptions extends {
    debounceTime?: number;
    defaultValue?: T;
    converter: UrlQueryParameterConverter<T>;
  },
>(queriesMap: Record<QueryKey, ParamOptions>) {
  const initialState = Object.entries<ParamOptions>(queriesMap).reduce(
    (previousValue, [key, value]) => ({
      ...previousValue,
      [key]: value.defaultValue
    }),
    {}
  ) as Record<QueryKey, T>;

  return signalStoreFeature(
    withState(initialState),
    withComputed(() => {
      const route = inject(ActivatedRoute);
      const destroyRef = inject(DestroyRef);
      const signals = Object.entries<ParamOptions>(queriesMap).reduce(
        (previousValue, [key, value]) => ({
          ...previousValue,
          [key]: toSignal(
            route.queryParamMap.pipe(
              map((queryParamMap) => queryParamMap.getAll(key)),
              distinctUntilChanged<string[]>(arraysAreEqual),
              takeUntilDestroyed(destroyRef),
              map((values) => {
                return value.converter.fromQuery(
                  values,
                  value.defaultValue,
                  null
                );
              })
            )
          ),
        }),
        {}
      ) as Record<QueryKey, Signal<T>>;

      const _computed = Object.entries<Signal<T>>(signals).reduce(
        (previousValue, [key, value]) => ({
          ...previousValue,
          [key]: computed(() =>value()),
        }),
        {}
      ) as Record<QueryKey, Signal<T>>;

      return {
        ..._computed,
      };
    }),
    withMethods(() => {
      const router = inject(Router);
      const route = inject(ActivatedRoute);
      const methods = Object.entries<ParamOptions>(queriesMap).reduce(
        (previousValue, [key, value]) => ({
          ...previousValue,
          [`set${capitalizeFirstLetter(key)}`]: (newValue: T) => {
            const queryParameterValues: string[] =
              route.snapshot.queryParamMap.getAll(key) || [];
            const newQueryParameterValues: string[] =
              (newValue !==
                value.defaultValue &&
                value.converter.toQuery(
                  newValue,
                  value.defaultValue,
                  queryParameterValues
                )) ||
              [];
            router.navigate([], {
              queryParams: {
                [key]: newQueryParameterValues,
              },
              queryParamsHandling: 'merge',
            });
          },
        }),
        {} as Record<`set${Capitalize<QueryKey>}`, (value: T) => void>
      );

      return {
        ...methods,
      };
    })
  );
}
