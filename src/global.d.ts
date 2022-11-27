interface GenericObject<T> {
  [key: string]: T;
}

type Maybe<T> = T | undefined;

type Unsubscriber = () => void;
