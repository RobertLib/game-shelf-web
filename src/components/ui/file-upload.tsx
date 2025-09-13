/*
import { Button, IconButton, Progress, Tooltip } from ".";
import { DIRECT_UPLOAD_BLOB_CREATE } from "../../graphql/mutations/blob";
import { DirectUploadBlob } from "../../__generated__/graphql";
import { getDictionary } from "../../dictionaries";
import { Upload, X } from "lucide-react";
import { use, useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";
import logger from "../../utils/logger";
import SnackbarContext from "../../contexts/snackbar-context";
import SparkMD5 from "spark-md5";

const MAX_FILE_SIZE = 200; // MB

export default function FileUpload({
  defaultAttachments = [],
  label,
  name,
  onUpload,
}: Readonly<{
  defaultAttachments?: Array<{
    id?: string;
    blobSignedId?: string | null;
    filename?: string | null;
    url?: string | null;
  }>;
  label?: string;
  name?: string;
  onUpload?: (blob: Omit<DirectUploadBlob, "id">) => void;
}>) {
  const dict = getDictionary();

  const [blobCreateMutation] = useMutation(DIRECT_UPLOAD_BLOB_CREATE);

  const [progress, setProgress] = useState(0);

  const [files, setFiles] = useState<
    {
      id: string;
      filename: string;
      signedId?: string | null;
      url?: string | null;
    }[]
  >(() =>
    defaultAttachments.map((attachment) => ({
      id: attachment.id || crypto.randomUUID(),
      filename: attachment.filename || "...",
      signedId: attachment.blobSignedId || undefined,
      url: attachment.url || undefined,
    })),
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const { enqueueSnackbar } = use(SnackbarContext);

  const upload = async (
    file: File,
    spark: SparkMD5.ArrayBuffer,
    target: HTMLInputElement,
  ) => {
    if (file.size > Math.pow(1024, 2) * MAX_FILE_SIZE) {
      enqueueSnackbar(
        dict.fileUpload.maxFileSizeExceeded.replace(
          "{0}",
          MAX_FILE_SIZE.toString(),
        ),
        "error",
      );

      setProgress(0);

      target.value = "";

      return;
    }

    try {
      setProgress(0.01);

      let checksum: string;
      try {
        const sparkResult = spark.end(true);
        if (typeof Buffer !== "undefined") {
          checksum = Buffer.from(sparkResult, "binary").toString("base64");
        } else {
          // Fallback for non-Buffer environments (some browsers)
          checksum = btoa(sparkResult);
        }
      } catch (error) {
        logger.error("Failed to generate checksum", error);
        enqueueSnackbar(dict.fileUpload.uploadFailed, "error");
        return;
      }

      logger.info("Starting file upload", {
        filename: file.name,
        size: file.size,
        type: file.type,
        checksum,
      });

      let data;
      try {
        const result = await blobCreateMutation({
          variables: {
            input: {
              byteSize: file.size,
              contentType: file.type,
              filename: file.name,
              checksum,
            },
          },
        });
        data = result.data;
        logger.info("Blob creation response", { data });
      } catch (error) {
        logger.error("GraphQL mutation failed:", error);

        const apolloError = error as {
          networkError?: { statusCode?: number };
          graphQLErrors?: { message: string }[];
        };

        if (apolloError.networkError?.statusCode === 500) {
          enqueueSnackbar("Server error while creating upload URL", "error");
        } else if (
          apolloError.graphQLErrors &&
          apolloError.graphQLErrors.length > 0
        ) {
          enqueueSnackbar(
            `GraphQL chyba: ${apolloError.graphQLErrors[0].message}`,
            "error",
          );
        } else {
          enqueueSnackbar(dict.fileUpload.uploadFailed, "error");
        }
        return;
      }

      const { blob } = data?.directUploadBlobCreate ?? {};

      if (!blob) {
        logger.error("No blob returned from directUploadBlobCreate");
        enqueueSnackbar(dict.fileUpload.uploadFailed, "error");
        return;
      }

      if (!blob.url) {
        logger.error("No upload URL provided in blob response");
        enqueueSnackbar(dict.fileUpload.uploadFailed, "error");
        return;
      }

      logger.info("Starting direct upload to", blob.url);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", blob.url!, true);

        for (const [key, value] of Object.entries(blob.headers)) {
          xhr.setRequestHeader(key, value as string);
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progressPercent = (event.loaded / event.total) * 100;
            setProgress(progressPercent);
            logger.info(`Upload progress: ${progressPercent.toFixed(1)}%`);
          }
        };

        xhr.onload = () => {
          logger.info(`Upload completed with status: ${xhr.status}`);
          if (xhr.status >= 200 && xhr.status < 300) {
            setFiles((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                filename: file.name,
                signedId: blob.signedId,
              },
            ]);

            onUpload?.(blob);

            resolve();
          } else {
            logger.error(
              `Upload failed with status ${xhr.status}: ${xhr.statusText}`,
            );
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        };

        xhr.onerror = (error) => {
          logger.error("Upload XHR error", error);
          reject(
            new Error(
              `Network error: ${xhr.statusText || "Connection failed"}`,
            ),
          );
        };

        xhr.onabort = () => {
          logger.error("Upload aborted");
          reject(new Error("Upload aborted"));
        };

        logger.info("Sending file to upload URL");
        xhr.send(file);
      });
    } catch (error) {
      logger.error(error);

      enqueueSnackbar(dict.fileUpload.uploadFailed, "error");
    } finally {
      setProgress(0);

      target.value = "";
    }
  };

  const handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    const fileReader = new FileReader();
    const chunkSize = 2097152; // Read in chunks of 2MB
    const spark = new SparkMD5.ArrayBuffer();

    let currentChunk = 0;

    const loadNext = () => {
      const start = currentChunk * chunkSize;
      const end =
        start + chunkSize >= file.size ? file.size : start + chunkSize;

      fileReader.readAsArrayBuffer(File.prototype.slice.call(file, start, end));
    };

    fileReader.onload = () => {
      if (!(fileReader.result instanceof ArrayBuffer)) {
        return;
      }

      spark.append(fileReader.result);

      currentChunk++;

      const chunks = Math.ceil(file.size / chunkSize);

      setProgress((currentChunk / chunks) * 100);

      if (currentChunk < chunks) {
        loadNext();
      } else {
        upload(file, spark, target);
      }
    };

    fileReader.onerror = (error) => {
      logger.error("File reading failed", error);
      enqueueSnackbar(dict.fileUpload.uploadFailed, "error");
      setProgress(0);
      target.value = "";
    };

    loadNext();
  };

  return (
    <div className="my-4">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {files.length > 0 && (
        <div className="mb-4 max-h-44 overflow-auto">
          {files.map(({ id, filename, url }) => (
            <div
              className="mb-2 flex items-center rounded-md border border-gray-200 bg-white p-2 shadow-sm last:mb-0 dark:border-gray-700 dark:bg-gray-800"
              key={id}
            >
              <div className="flex-1 truncate">
                <a
                  className="link text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  href={url ?? ""}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {filename}
                </a>
              </div>
              <Tooltip title={dict.actions.delete}>
                <IconButton
                  aria-label="delete"
                  onClick={() => {
                    setFiles((prev) => prev.filter((file) => file.id !== id));
                  }}
                  variant="danger"
                >
                  <X size={16} />
                </IconButton>
              </Tooltip>
            </div>
          ))}
        </div>
      )}

      {progress > 0 ? (
        <>
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            {dict.fileUpload.uploading}
          </p>
          <Progress value={progress} />
        </>
      ) : (
        <Button
          onClick={() => inputRef.current?.click()}
          size="sm"
          variant="outline"
        >
          <Upload className="mr-2" size={16} />
          {dict.fileUpload.upload}
        </Button>
      )}

      <input
        onChange={handleChange}
        ref={inputRef}
        style={{ display: "none" }}
        type="file"
      />

      {files.map(({ id, signedId }) =>
        signedId ? (
          <input key={id} name={name} type="hidden" value={signedId} />
        ) : null,
      )}
    </div>
  );
}
*/
