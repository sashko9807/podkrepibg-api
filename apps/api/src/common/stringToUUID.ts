import { v5 as uuidv5 } from 'uuid'
export function stringToUUID(name: string) {
  const NAMESPACE_OID = '6ba7b812-9dad-11d1-80b4-00c04fd430c8'
  return uuidv5(name, NAMESPACE_OID)
}
