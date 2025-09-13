import { CombinedGraphQLErrors } from "@apollo/client/errors";
import {
  camelToSnakeCase,
  snakeToCamelCase,
} from "../../../utils/case-conversion";

export const getFieldError = (error: unknown, fieldName: string) => {
  if (!error || !CombinedGraphQLErrors.is(error)) return undefined;

  const errorExtensions = error.errors?.[0]?.extensions;

  // New format with problems field
  if (errorExtensions?.problems && Array.isArray(errorExtensions.problems)) {
    const fieldPath = fieldName.split(".");

    for (const problem of errorExtensions.problems) {
      if (problem.path && Array.isArray(problem.path) && problem.explanation) {
        // Compare path arrays
        if (
          problem.path.length === fieldPath.length &&
          problem.path.every(
            (segment: string, index: number) =>
              segment === fieldPath[index] ||
              snakeToCamelCase(segment) === fieldPath[index] ||
              camelToSnakeCase(segment) === fieldPath[index],
          )
        ) {
          return problem.explanation;
        }
      }
    }
  }

  // Original format (fallback)
  const validation = errorExtensions as Record<string, string[]> | undefined;

  if (!validation) return undefined;

  if (validation[fieldName]) {
    return validation[fieldName][0];
  }

  const snakeCaseKey = camelToSnakeCase(fieldName);
  if (validation[snakeCaseKey]) {
    return validation[snakeCaseKey][0];
  }

  const camelCaseKey = snakeToCamelCase(fieldName);
  if (validation[camelCaseKey]) {
    return validation[camelCaseKey][0];
  }

  return undefined;
};
