// Material Design icons (from react-icons) exported under the names the app
// already uses, so call sites stay unchanged. They render as inline SVGs styled
// via `currentColor` — no web font or runtime CDN. Outlined variants are used
// to match the app's line aesthetic.
import type { IconBaseProps, IconType } from "react-icons";
import {
  MdOutlineMic,
  MdOutlineMicOff,
  MdOutlineVideocam,
  MdOutlineVideocamOff,
  MdOutlineVolumeUp,
  MdCallEnd,
  MdClose,
  MdCheck,
  MdAdd,
  MdOutlineContentCopy,
  MdOutlineDelete,
  MdOutlinePeople,
  MdOutlineOpenInNew,
  MdOutlineLink,
} from "react-icons/md";

// Keep the old 20px default; callers can still override with size or
// width/height (both map to react-icons' `size`).
function icon(Glyph: IconType) {
  return function Icon({ size, width, height, ...rest }: IconBaseProps) {
    return <Glyph size={size ?? width ?? height ?? 20} {...rest} />;
  };
}

export const MicIcon = icon(MdOutlineMic);
export const MicOffIcon = icon(MdOutlineMicOff);
export const CameraIcon = icon(MdOutlineVideocam);
export const CameraOffIcon = icon(MdOutlineVideocamOff);
export const SpeakerIcon = icon(MdOutlineVolumeUp);
export const HangUpIcon = icon(MdCallEnd);
export const XIcon = icon(MdClose);
export const CheckIcon = icon(MdCheck);
export const PlusIcon = icon(MdAdd);
export const CopyIcon = icon(MdOutlineContentCopy);
export const TrashIcon = icon(MdOutlineDelete);
export const UsersIcon = icon(MdOutlinePeople);
export const ExternalLinkIcon = icon(MdOutlineOpenInNew);
export const LinkIcon = icon(MdOutlineLink);
